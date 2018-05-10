import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  common: {
    id: 'common',
    data: {},
    schema: {
      title: "Common <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below:</p>",
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
          title: 'Author(s)',
          type: 'array',
          items: {
            title: 'Author',
            type: 'object',
            properties: {
              author: {
                title: 'Name',
                type: 'string',
                fieldClass: 'body-text col-6 pull-left pl-0',
              },
              orcid: {
                title: 'ORCiD',
                type: 'string',
                fieldClass: 'body-text col-6 pull-left pr-0',
              }
            }
          }
        }
      },
    },
    options: {
      fields: {
        title: {
          type: 'text',
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
          placeholder: 'Enter astract',
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
          type: 'array',
          // actionbarStyle: 'bottom'
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
      const step = this.get('currentFormStep');
      if (step + 1 < this.get('schemas').length) {
        this.set('currentFormStep', step + 1);
        this.set('schema', this.get('schemas')[step + 1]);
      } else {
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
