import Component from '@ember/component';
import Ember from 'ember';
// import formTemplate from '../../utils/custom_form';


let schema = {
"schema": {
   "type": "object",
   "properties": {
     "volume": {
       "type": "string",
       "required": false
     },
     "issue": {
       "type": "string",
       "required": false,
     },
     "publicationDate": {
        "title": "Publication Date",
        "description": "Select your publication date",
        "format": "datetime"
      },
      "publicationType": {
        "type":"string",
        "title":"Publication Type",
        "enum":['ElectronicPublication','PrintPublication'],
        "required":false
      },
      "abstract": {
        "type": "string",
        "required": false,
      },
      "subjects": {
        "type": "string",
        "required": false,
      },
      "articleURL": {
        "type": "string",
        "required": false,
      },
      "fName": {
        "type": "string",
        "required": false,
      },
      "mName": {
        "type": "string",
        "required": false,
      },
      "lName": {
        "type": "string",
        "required": false,
      },
      "orcid": {
        "type": "string",
        "required": false,
      },
      "email": {
        "type": "string",
        "required": false,
      },
      "affiliation": {
        "type": "string",
        "required": false,
      }
   }
 },
 "options": {
   "fields": {
     "volume": {
       "type": "text",
       "label": "Volume",
       "helpers": [],
       "validate": true,
       "disabled": false,
       "showMessages": true,
       "renderButtons": true,
       "data": {},
       "attributes": {},
       "allowOptionalEmpty": true,
       "autocomplete": false,
       "disallowEmptySpaces": false,
       "disallowOnlyEmptySpaces": false,
       "placeholder": "Enter the volume"
     },
     "issue": {
       "type": "text",
       "label": "Issue",
       "helpers": [],
       "validate": true,
       "disabled": false,
       "showMessages": true,
       "renderButtons": true,
       "data": {},
       "attributes": {},
       "allowOptionalEmpty": true,
       "autocomplete": false,
       "disallowEmptySpaces": false,
       "disallowOnlyEmptySpaces": false,
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
              "Print Publication",
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
      "articleURL": {
          "type": "text",
          "label": "Final article URL",
          "placeholder": "",
          "fieldClass": "clearfix"
      },
      "fName": {
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
      "lName": {
          "type": "text",
          "label": "Last Name",
          "placeholder": "",
          "fieldClass": "col-4 pull-left"
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
   },
   "focus": false,
   "type": "object",
   "helpers": [],
   "validate": true,
   "disabled": false,
   "showMessages": true,
   "collapsible": false,
   "legendStyle": "button"
 },
 // "view": "web-edit"
};


export default Ember.Component.extend({
  // session: Ember.inject.service(),
  // store: Ember.inject.service(),
  // metaDataString: Ember.computed('output', function() {
  //   return JSON.stringify(this.get('output'));
  // }),
  actions: {

  },
  didRender() {
    // const that = this;
    // let originalForm = this.get('input');
    // let newForm = JSON.parse(JSON.stringify(originalForm));
    // if (!originalForm.options) {
    //   newForm['options'] = {};
    // }
    // if (!originalForm['view']) {
    //   newForm['view'] = 'web-edit';
    // }
    // newForm.options.form = {
    //   "buttons": {
    //     "submit": {
    //       "label": "Save Changes to Metadata",
    //       "click": function() {
    //         var value = this.getValue();
    //         that.set('output', value);
    //       }
    //     }
    //   }
    //};

    $(document).ready(function() {
      console.log($("#myAlpacaForm"))
      $("#myAlpacaForm").alpaca(schema);
    });
  }
});
