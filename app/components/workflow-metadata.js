import Component from '@ember/component';

export default Component.extend({
  common: {
    "id": 'common',
    "data": {},
    "schema": {
      "title": "Common <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below:</p>",
      "type": "object",
      "properties": {
        "volume": {
          "type": "string",
          "required": true
        },
        "issue": {
          "type": "string",
          "required": true
        },
        "publicationDate": {
          "title": "Publication Date",
          "description": "Select your publication date",
          "format": "datetime",
          "required": true
        },
        "publicationType": {
          "type": "string",
          "title": "Publication Type",
          "enum": ["ElectronicPublication", "PrintPublication"],
          "required": true
        },
        "abstract": {
          "type": "string",
          "required": true
        },
        "subjects": {
          "type": "string",
          "required": true
        },
        "URL": {
          "type": "string",
          "required": true
        },
        "auothor": {
          "type": "string",
          "required": true
        },
        "mName": {
          "type": "string",
        },
        "family": {
          "type": "string",
          "required": true
        },
        "orcid": {
          "type": "string",
          "required": true
        },
        "email": {
          "type": "string",
          "required": true
        },
        "affiliation": {
          "type": "string",
          "required": true
        }
      }
    },
    "options": {
      "fields": {
        "volume": {
          "type": "text",
          "label": "Volume",
          "placeholder": "Enter the volume"
        },
        "issue": {
          "type": "text",
          "label": "Issue",
          "placeholder": "Enter issue"
        },
        "publicationDate": {
          "type": "text",
          "label": "Publication Date",
          "placeholder": "mm/dd/yy",
          "fieldClass": "col-4 pull-left pl-0"
        },
        "publicationType": {
          "type": "select",
          "helper": "Select your Publication type.",
          "fieldClass": "pull-left col-8 pr-0",
          "optionLabels": [
            "Electronic Publication",
            "Print Publication"
          ]
        },
        "abstract": {
          "type": "textarea",
          "label": "Abstract",
          "placeholder": "Enter astract",
          "fieldClass": "clearfix"
        },
        "subjects": {
          "type": "text",
          "label": "Subjects",
          "placeholder": "subject, subject",
          "fieldClass": "clearfix"
        },
        "URL": {
          "type": "text",
          "label": "Final article URL",
          "placeholder": "",
          "fieldClass": "clearfix"
        },
        "auothor": {
          "type": "text",
          "label": "First Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left pl-0"
        },
        "mName": {
          "type": "text",
          "label": "Middle Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left"
        },
        "family": {
          "type": "text",
          "label": "Last Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left pr-0"
        },
        "orcid": {
          "type": "text",
          "label": "ORCiD",
          "placeholder": "",
          "fieldClass": "clearfix"
        },
        "email": {
          "type": "text",
          "label": "Email Address",
          "placeholder": ""
        },
        "affiliation": {
          "type": "text",
          "label": "Affiliation",
          "placeholder": ""
        }
      }
    }
  },
  nih: {
    "id": "nih",
    "data": {},
    "schema": {
      "title": "NIH Manuscript Submission System (NIHMS) <br><p class='lead text-muted'>The following metadata fields will be part of the NIHMS submission.</p>",
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "required": true
        },
        "journal-title-short": {
          "type": "string",
          "required": true
        },
        "journal-NLMTA-ID": {
          "type": "string",
          "required": true
        },
        "ISSN": {
          "type": "string",
          "required": true
        },
        "auothor": {
          "type": "string",
          "required": true
        },
        "mName": {
          "type": "string",
        },
        "family": {
          "type": "string",
          "required": true
        },
        "email": {
          "type": "string",
          "required": true
        }
      }
    },
    "options": {
      "fields": {
        "title": {
          "type": "text",
          "label": "Article / Manuscript Title",
          "placeholder": "Enter the manuscript title",
        },
        "journal-title-short": {
          "type": "text",
          "label": "Journal Title",
          "placeholder": "Enter the journal title"
        },
        "journal-NLMTA-ID": {
          "type": "text",
          "label": "Journal NLMTA ID",
          "placeholder": ""
        },
        "ISSN": {
          "type": "text",
          "label": "ISSN",
          "placeholder": ""
        },
        "auothor": {
          "type": "text",
          "label": "First Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left pl-0"
        },
        "mName": {
          "type": "text",
          "label": "Middle Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left"
        },
        "family": {
          "type": "text",
          "label": "Last Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left pr-0"
        },
        "email": {
          "type": "text",
          "label": "Email Address",
          "placeholder": ""
        }
      }
    }
  },
  ed: {
    "id": 'ed',
    "schema": {
      "title": "Department of Education (ED) <br><p class='lead text-muted'>ED submissions can not be submitted through PASS. You will be prompted how to submit on the last step.</p>",
      "type": "object",
      "properties": {}
    },
    "options": {
      "fields": {}
    }
  },

  schema: {},
  schemas: ['common', 'nih', 'ed'],
  currentFormStep: 0,

  didInsertElement() {
    this.set('schemas', [this.get('common'), this.get('nih'), this.get('ed')]);
    this.get('metadataForms').forEach((form) => {
      let schemas = this.get('schemas');
      if (form) {
        try {
          let parsedForm = JSON.parse(form);
          schemas.addObject(parsedForm);
        } catch(e) {
            console.log("ERROR:", e);
        }
      }
    });
    this.set('schema', this.schemas[0]);
  },

  activePolicies: Ember.computed('model.newSubmission', function() {
    // policies can come from repositories
    let repos = [];
    let policies = [];
    this.get('model.newSubmission.deposits').forEach((deposit) => {
      repos.addObject(deposit.get('repository'));
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

  metadataForms: Ember.computed('activePolicies', function() {
    const retVal = this.get('activePolicies').map((policy) => policy.get('metadata'));
    return retVal;
  }),

  displayFormStep: Ember.computed('currentFormStep', function() {
    return this.get('currentFormStep') + 1;
  }),
  actions: {
    nextForm() {
      let step = this.get('currentFormStep');
      if (step + 1 < this.get('schemas').length) {
        this.set('currentFormStep', step+1);
        this.set('schema', this.schemas[step+1]);
      } else {
        this.sendAction('next');
      }
    },
    previousForm() {
      let step = this.get('currentFormStep');
      if (step > 0) {
        this.set('currentFormStep', step-1);
        this.set('schema', this.schemas[step-1]);
      } else {
        this.sendAction('back');
      }
    }
  }
});
