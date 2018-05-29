import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  common: {
    id: 'common',
    data: {},
    schema: {
      title: "Common <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below. If DOI was provided in the initial step of the submission, the metadata associated with that DOI was looked up and used to prepopulate this form. </p>",
      type: 'object',
      properties: {
        title: {
          type: 'string',
          required: true
        },
        'container-title': {
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
        publicationType: {
          type: 'string',
          title: 'Publication Type',
          enum: ['ElectronicPublication', 'PrintPublication'],
        },
        abstract: {
          type: 'string',
        },
        subjects: {
          type: 'string',
        },
        URL: {
          type: 'string',
        },
        authors: {
          title: '<div class="row"><div class="col-6">Author(s)</div><div class="col-6 p-0">ORCID(s)</div></div>',
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
          placeholder: 'Enter the manuscript title'
        },
        'container-title': {
          type: 'text',
          label: 'Journal Title',
          placeholder: 'Enter the journal title'
        },
        volume: {
          type: 'text',
          label: 'Volume',
          placeholder: 'Enter the volume',
        },
        issue: {
          type: 'text',
          label: 'Issue',
          placeholder: 'Enter issue',
        },
        ISSN: {
          type: 'text',
          label: 'ISSN',
          placeholder: 'ISSN'
        },
        publicationDate: {
          type: 'text',
          label: 'Publication Date',
          placeholder: 'mm/dd/yy',
          fieldClass: 'col-4 pull-left pl-0',
        },
        publicationType: {
          type: 'select',
          noneLabel: 'Select your Publication type.',
          fieldClass: 'pull-left col-8 pr-0',
          optionLabels: [
            'Electronic Publication',
            'Print Publication',
          ],
        },
        abstract: {
          type: 'textarea',
          label: 'Abstract',
          placeholder: 'Enter abstract',
          fieldClass: 'clearfix',
        },
        subjects: {
          type: 'text',
          label: 'Subjects',
          placeholder: 'subject, subject',
          fieldClass: 'clearfix',
        },
        URL: {
          type: 'text',
          label: 'Final article URL',
          placeholder: '',
          fieldClass: 'clearfix',
        },
        authors: {
        },
        'under-embargo': {
          type: 'checkbox',
          rightLabel: 'The material being submitted is published under an embargo.',
          fieldClass: 'm-0 mt-4'
        },
        'Embargo-end-date': {
          type: 'date',
          label: 'Embargo End Date',
          placeholder: 'mm/dd/yyyy',
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
    return retVal;
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
            this.set('didNotAgree', true);
          } else {
            this.set('didNotAgree', false);
          }
        }
      }
      const step = this.get('currentFormStep');
      if (step + 1 < this.get('schemas').length) {
        this.set('currentFormStep', step + 1);
        this.set('schema', this.get('schemas')[step + 1]);
      } else {
        // Add any crossref info that was not added through the metadata forms
        const doiInfo = this.get('doiInfo');
        let metadata = JSON.parse(this.get('model.newSubmission.metadata'));
        metadata.push({
          id: 'crossref',
          data: {
            doi: doiInfo.DOI,
            publisher: doiInfo.publisher,
            'journal-title-short': doiInfo['container-title-short']
          },
        });


        JSON.parse(this.get('model.newSubmission.metadata')).map((m) => {
          if (m.id.includes('eric')) {
            metadata.push({
              id: 'external-submissions',
              data: {
                submission: 'Prompted to deposit into Educational Resources Information Center (ERIC).'
              },
            });
          }
        });
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
