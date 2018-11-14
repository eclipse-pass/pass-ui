import WorkflowComponent from './workflow-component';
import _ from 'lodash';
import { inject as service, } from '@ember/service';

function getBrowserInfo() {
  let ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE ', version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/);
    if (tem != null) {
      return { name: 'Opera', version: tem[1] };
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  //  eslint-disable-next-line
  if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
  return {
    name: M[0],
    version: M[1]
  };
}


export default WorkflowComponent.extend({
  didAgree: false,
  router: service(),
  common: {
    id: 'common',
    data: {},
    schema: {
      title: "Publication Details <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below. If DOI was provided in the initial step of the submission, the metadata associated with that DOI was found and used to prepopulate this form. </p> <p class='lead text-muted'> <i class='glyphicon glyphicon-info-sign'></i> Fields that are not editable were populated using metadata associated with the provided DOI. </p>",
      type: 'object',
      properties: {
        title: {
          type: 'string',
          required: true
        },
        'journal-title': {
          type: 'string',
          required: true
        },
        volume: {
          type: 'string',
        },
        issue: {
          type: 'string',
        },
        ISSN: {
          type: 'string'
        },
        publisher: {
          type: 'string'
        },
        publicationDate: {
          title: 'Publication Date',
          description: 'Select your publication date',
          format: 'datetime',
        },
        abstract: {
          type: 'string',
        },
        // subjects: {
        //   type: 'string',
        // },
        authors: {
          title: '<div class="row"><div class="col-6">Author(s) <small class="text-muted">(optional)</small> </div><div class="col-6 p-0">ORCID(s)</div></div>',
          // required: true,
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'object',
            properties: {
              author: {
                type: 'string',
                fieldClass: 'body-text col-6 pull-left pl-0',
              },
              orcid: {
                type: 'string',
                fieldClass: 'body-text col-6 pull-left pr-0',
              }
            }
          }
        },
        'under-embargo': {
          type: 'string'
        },
        'Embargo-end-date': {
          type: 'string',
          format: 'date'
        }
      }
    },
    options: {
      fields: {
        title: {
          type: 'textarea',
          rows: 2,
          cols: 100,
          label: 'Article / Manuscript Title',
          placeholder: 'Enter the manuscript title',
          hidden: false,
        },
        'journal-title': {
          type: 'text',
          label: 'Journal Title',
          placeholder: 'Enter the journal title',
          hidden: false,
        },
        volume: {
          type: 'text',
          label: 'Volume  <small class="text-muted">(optional)</small>',
          placeholder: 'Enter the volume',
          hidden: false,
        },
        issue: {
          type: 'text',
          label: 'Issue  <small class="text-muted">(optional)</small>',
          placeholder: 'Enter issue',
          hidden: false,
        },
        ISSN: {
          type: 'text',
          label: 'ISSN <small class="text-muted">(optional)</small>',
          placeholder: 'ISSN',
          hidden: false,
        },
        publisher: {
          type: 'text',
          label: 'Publisher <small class="text-muted">(optional)</small>',
          placeholder: 'Enter the Publisher',
          hidden: false,
        },
        publicationDate: {
          type: 'text',
          label: 'Publication Date  <small class="text-muted">(optional)</small>',
          placeholder: 'mm/dd/yy',
          hidden: false,
        },
        abstract: {
          type: 'textarea',
          label: 'Abstract <small class="text-muted">(optional)</small>',
          placeholder: 'Enter abstract',
          fieldClass: 'clearfix',
          hidden: false,
        },
        // subjects: {
        //   type: 'text',
        //   label: 'Keywords <small class="text-muted">(optional)</small>',
        //   placeholder: '',
        //   fieldClass: 'clearfix',
        //   hidden: true,
        // },
        authors: {
          hidden: false,
        },
        'under-embargo': {
          type: 'checkbox',
          rightLabel: 'The material being submitted is published under an embargo.',
          fieldClass: 'm-0 mt-4',
          hidden: false,
        },
        'Embargo-end-date': {
          type: 'date',
          label: 'Embargo End Date',
          helper: '<i>After the embargo end date, your submission manuscripts or article can be made public. <b>If this publication is not under embargo, please leave this field blank.<b></i>',
          helpersPosition: 'above',
          placeholder: 'dd/mm/yyyy',
          validate: true,
          inputType: 'date',
          fieldClass: 'date-time-picker',
          picker: {
            format: 'MM/DD/YY',
            allowInputToggle: true
          }
        },
      },
    },
  },
  schema: {},
  currentFormStep: 0,
  schemas: [],
  init() {
    this._super(...arguments);
    this.set('schemas', []);
  },
  willRender() {
    let schemas = this.get('schemas');
    this.set('schemas', []);

    this.get('metadataForms').forEach((form) => { if (form) schemas.addObject(form); });
    this.set('schemas', _.uniqBy(schemas, 'id'));
    this.set('schema', this.get('metadataForms')[this.get('currentFormStep')]);
  },

  activeRepositories: Ember.computed('model.newSubmission', function () {
    const repos = Ember.A();
    this.get('model.newSubmission.repositories').forEach((repository) => {
      repos.addObject(repository);
    });
    return repos.uniqBy('id');
  }),

  metadataForms: Ember.computed('activeRepositories', function () {
    let retVal = this.get('activeRepositories').filterBy('formSchema');
    retVal = retVal.map(repository => JSON.parse(repository.get('formSchema')));
    // TODO: REMOVE BEFORE PUSHING CODE THIS IS NOT SUPOSE TO BE PUSHED REMOVE THIS LINE OMG DO NOT LEAVE THIS LINE YOU BETTER NOT
    // retVal.unshift(this.get('JScholarship'));
    retVal.unshift(this.get('common'));
    // NOTE: This is here to remove nih from the schmas array. remove this line once NIH has a better schema.
    return retVal.filter(x => x.id !== 'nih'); // return retval;
  }),

  displayFormStep: Ember.computed('currentFormStep', function () {
    return this.get('currentFormStep') + 1;
  }),
  actions: {
    nextForm() {
      let doAuthorsExist = false;
      JSON.parse(this.get('model.newSubmission.metadata')).forEach((data) => {
        if (data.id === 'JScholarship') {
          // data.data.authors = temp;
          if (data.data.authors && data.data.authors.length > 0) {
            let containsTextArray = [];
            data.data.authors.forEach((author) => {
              if (author.author) {
                containsTextArray.push(true);
              } else {
                doAuthorsExist = false;
              }
            });
            if (containsTextArray.includes(true)) {
              doAuthorsExist = true;
            }
          } else {
            doAuthorsExist = false;
          }
        }
      });
      let value = null;
      if (this.get('schemas')[this.get('currentFormStep')].id === 'JScholarship') {
        if ($('[name="agreement-to-deposit"]').length == 2) {
          value = $('[name="agreement-to-deposit"]')[1].checked;
        }
        // if proxy sub then set value of deposit agreement = true to let it pass.
        if (this.get('hasProxy')) {
          value = true;
        }
        let jhuRepo = this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
        // if jhuRepo exists
        if (jhuRepo.length > 0) {
          // ----------------------------------------------------------------------
          //
          // if USER has not agreed to deposit but has one user
          //
          // ----------------------------------------------------------------------
          // debugger; // eslint-disable-line
          let userIsSubmitter = this.get('model.newSubmission.submitter.id') === this.get('currentUser.user.id');
          if (doAuthorsExist && !value && userIsSubmitter) {
            swal({
              title: 'Notice!',
              text: 'You added JScholarship as a repository but didn\'t agree to the deposit agreement, so your submission will not be submitted to JScholarship. To fix this, agree to the deposit agreement below.',
              showCancelButton: true,
              confirmButtonText: 'Return to deposit agreement',
              cancelButtonText: 'Proceed anyway'
            }).then((result) => {
              if (result.value) {
                // agree to deposit
                return;
              }
              if (result.dismiss != 'overlay') {
                // remove jscholarship from submission
                this.set('model.newSubmission.repositories', this.get('model.newSubmission.repositories').filter(repo => repo.get('name') !== 'JScholarship'));
                if (this.get('model.newSubmission.repositories.length') == 0) {
                  swal({
                    title: 'You\'re about to abort the submission!',
                    text: 'The submission cannot proceed with out the required information by its target repository. Click "Abort" to confirm your exit.',
                    showCancelButton: true,
                    confirmButtonText: 'Abort',
                    cancelButtonText: 'Go back to add information'
                  }).then((value) => {
                    if (value.dismiss) {
                      return;
                    }
                    this.get('router').transitionTo('dashboard');
                  });
                } else {
                  if (result.dismiss != 'overlay') {
                    this.send('nextLogic');
                  }
                }
              }
            });
            // ----------------------------------------------------------------------
            //
            // if USER has not added at least one author but has agreed to deposit
            //
            // ----------------------------------------------------------------------
          } else if (value && !doAuthorsExist) {
            swal({
              title: 'Notice!',
              text: 'You added JScholarship as a repository. JScholarship requires that you list at least ONE author who is a member of the Johns Hopkins community. Please provide the name of one or more authors for this manuscript." can be used when submitter is missing the name of the author only.',
              showCancelButton: true,
              confirmButtonText: 'Add Authors',
              cancelButtonText: 'Proceed anyway'
            }).then((result) => {
              if (result.value) {
                // agree to add authors
                return;
              }
              if (result.dismiss != 'overlay') {
                this.set('model.newSubmission.repositories', this.get('model.newSubmission.repositories').filter(repo => repo.get('name') !== 'JScholarship'));
                if (this.get('model.newSubmission.repositories.length') == 0) {
                  swal({
                    title: 'You\'re about to abort the submission!',
                    text: 'The submission cannot proceed with out the required information by its target repository. Click "Abort" to confirm your exit.',
                    showCancelButton: true,
                    confirmButtonText: 'Abort',
                    cancelButtonText: 'Go back to add information'
                  }).then((value) => {
                    if (value.dismiss) {
                      return;
                    }
                    this.get('router').transitionTo('dashboard');
                  });
                } else {
                  if (result.dismiss != 'overlay') {
                    this.send('nextLogic');
                  }
                }
              }
            });
            // ----------------------------------------------------------------------
            //
            // if USER has not agreed to deposit and has not added at least one user
            //
            // ----------------------------------------------------------------------
          } else if (!doAuthorsExist && !value && this.get('userIsSubmitter')) {
            swal({
              title: 'Notice!',
              text: 'You added JScholarship as a repository. JScholarship requires that (a) you list at least ONE author who is a member of the Johns Hopkins community, and (b) you agree to the deposit statement. Please return to the form to provide the required information.',
              showCancelButton: true,
              confirmButtonText: 'Add author/Agree to deposit',
              cancelButtonText: 'Proceed anyway'
            }).then((result) => {
              if (result.value) {
                // agree to add authors
                return;
              }
              if (result.dismiss != 'overlay') {
                this.set('model.newSubmission.repositories', this.get('model.newSubmission.repositories').filter(repo => repo.get('name') !== 'JScholarship'));
                if (this.get('model.newSubmission.repositories.length') == 0) {
                  swal({
                    title: 'You\'re about to abort the submission!',
                    text: 'The submission cannot proceed with out the required information by its target repository. Click "Abort" to confirm your exit.',
                    showCancelButton: true,
                    confirmButtonText: 'Abort',
                    cancelButtonText: 'Go back to add information'
                  }).then((value) => {
                    if (value.dismiss) {
                      return;
                    }
                    this.get('router').transitionTo('dashboard');
                  });
                } else {
                  if (result.dismiss != 'overlay') {
                    this.send('nextLogic');
                  }
                }
              }
            });
          } else {
            this.send('nextLogic');
          }
        }
      } else {
        this.send('nextLogic');
      }
    },
    nextLogic() {
      const step = this.get('currentFormStep');
      let metadata = JSON.parse(this.get('model.newSubmission.metadata'));
      const doiInfo = this.get('doiInfo');
      let commonMetadata = metadata.filter(md => md.id === 'common')[0];
      this.send('checkForAuthors');
      // We need to reset the metadata because checkForAuthors changes it
      metadata = JSON.parse(this.get('model.newSubmission.metadata'));
      // We are moving the form forward next button clicked
      if (step + 1 < this.get('schemas').length) {
        this.set('currentFormStep', step + 1);
        // Move to next form
        this.set('schema', this.get('schemas')[step + 1]);
      } else {
        // Add any crossref info that was not added through the metadata forms
        if (commonMetadata.length > 0) {
          commonMetadata.data['issn-map'] = doiInfo['issn-map'];
        }

        if (!(metadata.filter(md => md.id === 'crossref')[0])) {
          metadata.push({
            id: 'crossref',
            data: {
              doi: doiInfo.DOI,
              publisher: doiInfo.publisher,
              'journal-title-short': doiInfo['container-title-short']
            },
          });
        }

        if (!(metadata.filter(md => md.id === 'pmc')[0])) {
          metadata.push({
            id: 'pmc',
            data: {
              nlmta: doiInfo.nlmta
            }
          });
        }

        if (!(metadata.filter(md => md.id === 'agent_information')[0])) {
          metadata.push({
            id: 'agent_information',
            data: {
              information: getBrowserInfo()
            }
          });
        }

        // Add metadata for external submissions only if the user is the submitter
        const externalRepos = this.get('model.newSubmission.repositories').filter(repo =>
          repo.get('integrationType') === 'web-link');

        if (this.get('model.newSubmission.submitter.id') === this.get('currentUser.user.id') &&
          externalRepos.get('length') > 0) {
          let md = { id: 'external-submissions', data: { submission: [] } };
          externalRepos.forEach(repo => md.data.submission.push({
            message: `Deposit into ${repo.get('name')} was prompted`,
            name: repo.get('name'),
            url: repo.get('url')
          }));

          metadata.push(md);
        }

        this.set('model.newSubmission.metadata', JSON.stringify(metadata));
        this.sendAction('next');
      }
    },
    previousForm() {
      const step = this.get('currentFormStep');
      this.send('checkForAuthors');
      if (step > 0) {
        this.set('currentFormStep', step - 1);
        this.set('schema', this.get('schemas')[step - 1]);
      } else {
        this.sendAction('back');
      }
    },
    checkForAuthors() {
      let schemaId = this.get('schema').id;
      // let currentFormStep = step;
      let metadata = JSON.parse(this.get('model.newSubmission.metadata'));

      let JScholarshipSchema = this.get('schemas').filter(md => md.id === 'JScholarship')[0];

      let commonMetadata = metadata.filter(md => md.id === 'common')[0];
      let JScholarshipMetadata = metadata.filter(md => md.id === 'JScholarship')[0];

      if (schemaId === 'common') {
        // update JScholarship
        let JScholarshipFlag = false;
        metadata.forEach((md, index) => {
          if (md.id === 'JScholarship') {
            JScholarshipFlag = true;
            //  if We have Commen Metadata with authors array in it
            if (commonMetadata && commonMetadata.data && commonMetadata.data.authors) {
              // set the JScholarship Metadata authors array equal to commons
              md.data = {
                authors: commonMetadata.data.authors,
                embargo: this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship')[0].get('agreementText'),
              };
            }
          }
        });
        // if we haven't found metadata relating to JScholarship BUT JScholarshipSchema is there instantiate a new JScholarshipMetadata obj
        if (!JScholarshipFlag && JScholarshipSchema) {
          JScholarshipMetadata = {
            id: 'JScholarship',
            data: {
              authors: commonMetadata.data.authors,
              embargo: this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship')[0].get('agreementText'),
            },
          };
          metadata.push(JScholarshipMetadata);
        }
      } else if (schemaId === 'JScholarship') {
        // update common
        metadata.forEach((md, index) => {
          if (md.id === 'common') {
            //  if We haveJScholarship Metadata with authors array in it
            if (JScholarshipMetadata && JScholarshipMetadata.data && JScholarshipMetadata.data.authors) {
              // set the common Metadata authors array equal to JScholarship
              if (md.data) {
                md.data.authors = JScholarshipMetadata.data.authors;
              } else {
                md.data = {
                  authors: JScholarshipMetadata.data.authors,
                };
              }
            }
          }
        });
      }
      this.set('model.newSubmission.metadata', JSON.stringify(metadata));
    }
  },
});
