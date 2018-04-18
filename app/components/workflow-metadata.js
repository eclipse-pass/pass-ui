import Component from '@ember/component';

export default Component.extend({
  common: {
    id: 'common',
    data: {},
    schema: {
      title: "Common <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below:</p>",
      type: 'object',
      properties: {
        volume: {
          type: 'string',
          required: true,
        },
        issue: {
          type: 'string',
          required: true,
        },
        publicationDate: {
          title: 'Publication Date',
          description: 'Select your publication date',
          format: 'datetime',
          required: true,
        },
        publicationType: {
          type: 'string',
          title: 'Publication Type',
          enum: ['ElectronicPublication', 'PrintPublication'],
          required: true,
        },
        abstract: {
          type: 'string',
          required: true,
        },
        subjects: {
          type: 'string',
          required: true,
        },
        URL: {
          type: 'string',
          required: true,
        },
        auothor: {
          type: 'string',
          required: true,
        },
        mName: {
          type: 'string',
        },
        family: {
          type: 'string',
          required: true,
        },
        orcid: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        affiliation: {
          type: 'string',
          required: true,
        },
      },
    },
    options: {
      fields: {
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
          helper: 'Select your Publication type.',
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
        auothor: {
          type: 'text',
          label: 'First Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left pl-0',
        },
        mName: {
          type: 'text',
          label: 'Middle Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left',
        },
        family: {
          type: 'text',
          label: 'Last Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left pr-0',
        },
        orcid: {
          type: 'text',
          label: 'ORCiD',
          placeholder: '',
          fieldClass: 'clearfix',
        },
        email: {
          type: 'text',
          label: 'Email Address',
          placeholder: '',
        },
        affiliation: {
          type: 'text',
          label: 'Affiliation',
          placeholder: '',
        },
      },
    },
  },
  nih: {
    id: 'nih',
    data: {},
    schema: {
      title: "NIH Manuscript Submission System (NIHMS) <br><p class='lead text-muted'>The following metadata fields will be part of the NIHMS submission.</p>",
      type: 'object',
      properties: {
        title: {
          type: 'string',
          required: true,
        },
        'journal-title-short': {
          type: 'string',
          required: true,
        },
        'journal-NLMTA-ID': {
          type: 'string',
          required: true,
        },
        ISSN: {
          type: 'string',
          required: true,
        },
        auothor: {
          type: 'string',
          required: true,
        },
        mName: {
          type: 'string',
        },
        family: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
      },
    },
    options: {
      fields: {
        title: {
          type: 'text',
          label: 'Article / Manuscript Title',
          placeholder: 'Enter the manuscript title',
        },
        'journal-title-short': {
          type: 'text',
          label: 'Journal Title',
          placeholder: 'Enter the journal title',
        },
        'journal-NLMTA-ID': {
          type: 'text',
          label: 'Journal NLMTA ID',
          placeholder: '',
        },
        ISSN: {
          type: 'text',
          label: 'ISSN',
          placeholder: '',
        },
        auothor: {
          type: 'text',
          label: 'First Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left pl-0',
        },
        mName: {
          type: 'text',
          label: 'Middle Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left',
        },
        family: {
          type: 'text',
          label: 'Last Name',
          placeholder: '',
          fieldClass: 'col-4 pull-left pr-0',
        },
        email: {
          type: 'text',
          label: 'Email Address',
          placeholder: '',
        },
      },
    },
  },
  embargo: {
    "id": 'embargo',
    "schema": {
      "title": "Embargo",
      "type": "object",
      "properties": {
        "under-embargo": {
          "type": "string",
        },
        "Embargo-end-date:": {
          "type": "string",
          "format": "date"
        },
        "embargo": {
          "type": "string",
          "default":"NON-EXCLUSIVE LICENSE FOR USE OF MATERIALS This non-exclusive license defines the terms for the deposit of Materials in all formats into the digital repository of materials collected, preserved and made available through the Johns Hopkins Digital Repository, JScholarship. The Contributor hereby grants to Johns Hopkins a royalty free, non-exclusive worldwide license to use, re-use, display, distribute, transmit, publish, re-publish or copy the Materials, either digitally or in print, or in any other medium, now or hereafter known, for the purpose of including the Materials hereby licensed in the collection of materials in the Johns Hopkins Digital Repository for educational use worldwide. In some cases, access to content may be restricted according to provisions established in negotiation with the copyright holder. This license shall not authorize the commercial use of the Materials by Johns Hopkins or any other person or organization, but such Materials shall be restricted to non-profit educational use. Persons may apply for commercial use by contacting the copyright holder. Copyright and any other intellectual property right in or to the Materials shall not be transferred by this agreement and shall remain with the Contributor, or the Copyright holder if different from the Contributor. Other than this limited license, the Contributor or Copyright holder retains all rights, title, copyright and other interest in the images licensed. If the submission contains material for which the Contributor does not hold copyright, the Contributor represents that s/he has obtained the permission of the Copyright owner to grant Johns Hopkins the rights required by this license, and that such third-party owned material is clearly identified and acknowledged within the text or content of the submission. If the submission is based upon work that has been sponsored or supported by an agency or organization other than Johns Hopkins, the Contributor represents that s/he has fulfilled any right of review or other obligations required by such contract or agreement. Johns Hopkins will not make any alteration, other than as allowed by this license, to your submission. This agreement embodies the entire agreement of the parties. No modification of this agreement shall be of any effect unless it is made in writing and signed by all of the parties to the agreement."
        },
        "agreement-to-embargo": {
          "type": "string",
        },
      }
    },
    "options": {
      "fields": {
        "under-embargo": {
          "type": "checkbox",
          "rightLabel": "The material being submitted is published under an embargo.",
          "fieldClass": "col-8 pull-left pl-0"
        },
        "Embargo-end-date:": {
          "type": "date",
          "placeholder": "mm/dd/yyyy",
          "fieldClass": "col-4 pull-left pl-0"
        },
        "embargo": {
          "type": "textarea",
          "label": "Embargo information",
          "disabled": true,
          "rows": "16"
        },
        "agreement-to-embargo": {
          "type": "checkbox",
          "rightLabel": "I agree to the above statement on todays date",
        },
      }
    }
  },

  schema: {},
  schemas: ['common', 'nih', 'ed', 'embargo'],
  currentFormStep: 0,

  didInsertElement() {
    this.set('schemas', [this.get('common'), this.get('nih'), this.get('embargo')]);
    this.get('metadataForms').forEach((form) => {
      const schemas = this.get('schemas');
      if (form) {
        try {
          const parsedForm = JSON.parse(form);
          schemas.addObject(parsedForm);
        } catch (e) {
          console.log('ERROR:', e);
        }
      }
    });
    this.set('schema', this.schemas[0]);
  },

  activePolicies: Ember.computed('model.newSubmission', function () {
    // policies can come from repositories
    const repos = [];
    const policies = [];
    this.get('model.newSubmission.repositories').forEach((repository) => {
      repos.addObject(repository);
    });
    // policies can come from funders
    this.get('model.newSubmission.grants').forEach((grant) => {
      repos.addObject(grant.get('funder.repository'));
      policies.addObject(grant.get('funder.policy'));
    });
    repos.forEach((repository) => {
      policies.addObject(repository.get('policy'));
    });
    return policies;
  }),

  metadataForms: Ember.computed('activePolicies', function () {
    const retVal = this.get('activePolicies').map(policy => policy.get('metadata'));
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
        this.set('schema', this.schemas[step + 1]);
      } else {
        this.sendAction('next');
      }
    },
    previousForm() {
      const step = this.get('currentFormStep');
      if (step > 0) {
        this.set('currentFormStep', step - 1);
        this.set('schema', this.schemas[step - 1]);
      } else {
        this.sendAction('back');
      }
    },
  },
});
