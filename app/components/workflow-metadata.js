import Component from '@ember/component';
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


export default Component.extend({
  didAgree: false,
  router: service(),
  common: {
    id: 'common',
    data: {},
    schema: {
      title: "Publication Details <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below. If DOI was provided in the initial step of the submission, the metadata associated with that DOI was found and used to prepopulate this form. </p>",
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
        publicationDate: {
          title: 'Publication Date',
          description: 'Select your publication date',
          format: 'datetime',
        },
        abstract: {
          type: 'string',
        },
        subjects: {
          type: 'string',
        },
        authors: {
          title: '<div class="row"><div class="col-6">Author(s)</div><div class="col-6 p-0">ORCID(s)</div></div>',
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
          hidden: true,
        },
        'journal-title': {
          type: 'text',
          label: 'Journal Title',
          placeholder: 'Enter the journal title',
          hidden: true,
        },
        volume: {
          type: 'text',
          label: 'Volume',
          placeholder: 'Enter the volume',
          hidden: true,
        },
        issue: {
          type: 'text',
          label: 'Issue',
          placeholder: 'Enter issue',
          hidden: true,
        },
        ISSN: {
          type: 'text',
          label: 'ISSN',
          placeholder: 'ISSN',
          hidden: true,
        },
        publicationDate: {
          type: 'text',
          label: 'Publication Date',
          placeholder: 'mm/dd/yy',
          hidden: true,
        },
        abstract: {
          type: 'textarea',
          label: 'Abstract',
          placeholder: 'Enter abstract',
          fieldClass: 'clearfix',
          hidden: true,
        },
        subjects: {
          type: 'text',
          label: 'Keywords',
          placeholder: '',
          fieldClass: 'clearfix',
          hidden: true
        },
        authors: {
          hidden: false,
        },
        'under-embargo': {
          type: 'checkbox',
          rightLabel: 'The material being submitted is published under an embargo.',
          fieldClass: 'm-0 mt-4',
          hidden: true,
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
    this.get('metadataForms').forEach((form) => {
      if (form) {
        try {
          schemas.addObject(form);
        } catch (e) {
          console.log('ERROR:', e);
        }
      }
    });
    this.set('schemas', _.uniqBy(schemas, 'id'));
    this.set('schema', this.get('metadataForms')[this.get('currentFormStep')]);
  },

  activeRepositories: Ember.computed('model.newSubmission', function () {
    const repos = Ember.A();
    const policies = Ember.A();
    this.get('model.newSubmission.repositories').forEach((repository) => {
      repos.addObject(repository);
    });
    return repos.uniqBy('id');
  }),

  metadataForms: Ember.computed('activeRepositories', function () {
    let retVal = this.get('activeRepositories').filterBy('formSchema');
    retVal = retVal.map(repository => JSON.parse(repository.get('formSchema')));
    retVal.unshift(this.get('common'));

    // NOTE: This is here to remove nih from the schmas array. remove this line once NIH has a better schema.
    return retVal.filter(x => x.id !== 'nih'); // return retval;
  }),

  displayFormStep: Ember.computed('currentFormStep', function () {
    return this.get('currentFormStep') + 1;
  }),
  actions: {
    nextForm() {
      if ($('[name="agreement-to-deposit"]').length == 2) {
        let value = $('[name="agreement-to-deposit"]')[1].checked;
        let jhuRepo = this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
        if (jhuRepo.length > 0) {
          if (!value) {
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

              // remove jscholarship from submission
              this.set('model.newSubmission.repositories', this.get('model.newSubmission.repositories').filter(repo => repo.get('name') !== 'JScholarship'));

              if (this.get('model.newSubmission.repositories.length') == 0) {
                swal(
                  'You\'re done!',
                  'If you don\'t plan on submitting to any repositories, you can stop at this time.',
                  {
                    buttons: {
                      cancel: true,
                      confirm: true,
                    }
                  },
                ).then((value) => {
                  if (value.dismiss) {
                    return;
                  }
                  this.get('router').transitionTo('dashboard');
                });
              } else {
                this.send('nextLogic');
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
      if (step + 1 < this.get('schemas').length) {
        this.set('currentFormStep', step + 1);
        this.set('schema', this.get('schemas')[step + 1]);
      } else {
        // Add any crossref info that was not added through the metadata forms
        const doiInfo = this.get('doiInfo');
        let metadata = JSON.parse(this.get('model.newSubmission.metadata'));

        const common = metadata.filter(md => md.id === 'common');
        if (common.length > 0) {
          common[0].data['issn-map'] = doiInfo['issn-map'];
        }

        metadata.push({
          id: 'crossref',
          data: {
            doi: doiInfo.DOI,
            publisher: doiInfo.publisher,
            'journal-title-short': doiInfo['container-title-short']
          },
        });

        metadata.push({
          id: 'pmc',
          data: {
            nlmta: doiInfo.nlmta
          }
        });

        metadata.push({
          id: 'agent_information',
          data: {
            information: getBrowserInfo()
          }
        });

        // Add metadata for external submissions
        const externalRepos = this.get('model.newSubmission.repositories').filter(repo =>
          repo.get('integrationType') === 'web-link' ||
          repo.get('url') === 'https://eric.ed.gov/' ||
          repo.get('url') === 'https://dec.usaid.gov/');
        if (externalRepos.get('length') > 0) {
          let md = { id: 'external-submissions', data: { submission: [] } };
          externalRepos.forEach(repo => md.data.submission.push(`Deposit into ${repo.get('name')} was prompted`));
          // Push this new thing to the overall 'metadata' obj
          metadata.push(md);
        }
        this.set('model.newSubmission.metadata', JSON.stringify(metadata));
        this.sendAction('next');
      }
    },
    previousForm() {
      const step = this.get('currentFormStep');
      if (step > 0) {
        this.set('currentFormStep', step - 1);
        this.set('schema', this.get('schemas')[step - 1]);
      } else {
        this.sendAction('back');
      }
    },
  },
});
