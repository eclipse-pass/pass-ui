import Component from '@ember/component';

export default Component.extend({
  common: {
  "id":0,
  "data":{},
  "schema": {
     "title": "Common <br><p class='lead text-muted'>Please provide additional information about your article/manuscript below:</p>",
     "type": "object",
     "properties": {
       "volume": {
         "type": "string",
         "required": false
       },
       "issue": {
         "type": "string",
         "required": false
       },
       "publicationDate": {
          "title": "Publication Date",
          "description": "Select your publication date",
          "format": "datetime"
        },
        "publicationType": {
          "type":"string",
          "title":"Publication Type",
          "enum":["ElectronicPublication","PrintPublication"],
          "required":false
        },
        "abstract": {
          "type": "string",
          "required": false
        },
        "subjects": {
          "type": "string",
          "required": false
        },
        "articleURL": {
          "type": "string",
          "required": false
        },
        "fName": {
          "type": "string",
          "required": false
        },
        "mName": {
          "type": "string",
          "required": false
        },
        "lName": {
          "type": "string",
          "required": false
        },
        "orcid": {
          "type": "string",
          "required": false
        },
        "email": {
          "type": "string",
          "required": false
        },
        "affiliation": {
          "type": "string",
          "required": false
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
  // nlmTa
 nih: {
  "id":1,
  "data":{},
  "schema": {
    "title": "NIH Manuscript Submission System (NIHMS) <br><p class='lead text-muted'>The following metadata fields will be part of the NIHMS submission.</p>",
     "type": "object",
     "properties": {
       "nlmTa": {
         "type": "string",
         "required": false
       },
       "publisherPDF": {
         "type":"string",
         "title":"Publisher's PDF",
         "enum":["yes","no"],
         "required":false
       },
       "displayPublisherPDF": {
         "type":"string",
         "title":"Display publisher's PDF instead of NIHMS-generated PDF",
         "enum":["yes","no"],
         "required":false
       },
        "embargoPeriod": {
         "type":"string",
         "title":"Embargo Period",
         "enum":[1,2,3,4,5,6,7,8,9,10,11,12],
         "required":false
       },
       "eLocationID": {
         "type": "string",
         "required": false
       },
       "firstPage": {
         "type": "string",
         "required": false
       },
       "lastPage": {
         "type": "string",
         "required": false
       },
       "selfURI": {
         "type": "string",
         "required": false
       },
       "articleIdType": {
         "type":"string",
         "title":"Article IDs <br> ID Type",
         "enum":["yes","no"],
         "required":false
       },
       "articleIdString": {
         "type": "string",
         "required": false
       },
       "permissionCopyrightStatement": {
         "type": "string",
         "required": false
       },
       "licenseType": {
         "type": "string",
         "required": false
       },
       "licenseLink": {
         "type": "string",
         "required": false
       },
       "principleFName": {
         "type": "string",
         "required": false
       },
       "principleMName": {
         "type": "string",
         "required": false
       },
       "principleLName": {
         "type": "string",
         "required": false
       },
       "principleOrcid": {
         "type": "string",
         "required": false
       },
       "principleEmail": {
         "type": "string",
         "required": false
       },
       "principleAffiliation": {
         "type": "string",
         "required": false
       },
       "fName": {
         "type": "string",
         "required": false
       },
       "mName": {
         "type": "string",
         "required": false
       },
       "lName": {
         "type": "string",
         "required": false
       },
       "email": {
         "type": "string",
         "required": false
       },

     }
   },
   "options": {
     "fields": {
       "nlmTa": {
         "type": "text",
         "label": "NLM TA",
         "placeholder": "Enter the NLM TA"
       },
       "publisherPDF": {
           "type": "select",
           "helper": "Is the publisher's PDF being submitted?",
           "optionLabels": [
             "Yes",
             "No"
             ]
       },
       "displayPublisherPDF": {
           "type": "select",
           "optionLabels": [
             "Yes",
             "No"
             ]
       },
       "embargoPeriod": {
           "type": "select",
           "helper": "# of months",
           "optionLabels":["1 month","2 month","3 month","4 month","5 month","6 month","7 month","8 month","9 month","10 month","11 month","12 month"]
       },
       "eLocationID": {
         "type": "text",
         "label": "Article Location <br> E-Location ID",
       },
       "firstPage": {
         "type": "text",
         "label": "OR <br> First Page",
       },
       "lastPage": {
         "type": "text",
         "label": "Last Page",
       },
       "selfURI": {
         "type": "text",
         "label": "Self-URI",
       },
       "articleIdType": {
           "type": "select",
           "optionLabels":["Publisher ID","Institution ID"]
       },
       "articleIdString": {
         "type": "text",
         "label": "Article Id String",
       },
       "permissionCopyrightStatement": {
         "type": "textarea",
         "label": "Permission <br> Copyright Statement",
         "placeholder": "Enter Copyright statement...",
         "fieldClass": "clearfix"
       },
       "licenseType": {
         "type": "text",
         "label": "License Type",
       },
       "licenseLink": {
         "type": "text",
         "label": "License Link",
       },
       "principleFName": {
           "type": "text",
           "label": "Principle Investigator(s)<br>First Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left pl-0 no-wrap"
       },
       "principleMName": {
           "type": "text",
           "label": "<br>Middle Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left no-wrap"
       },
       "principleLName": {
           "type": "text",
           "label": "<br>Last Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left pr-0 no-wrap"
       },
       "principleOrcid": {
           "type": "text",
           "label": "ORCiD",
           "placeholder": "",
           "fieldClass": "clearfix"
       },
       "principleEmail": {
           "type": "text",
           "label": "Email Address",
           "placeholder": ""
       },
       "principleAffiliation": {
           "type": "text",
           "label": "Affiliation",
           "placeholder": ""
       },
       "fName": {
           "type": "text",
           "label": "Contact(s)<br>First Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left pl-0 no-wrap"
       },
       "mName": {
           "type": "text",
           "label": "<br>Middle Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left no-wrap"
       },
       "lName": {
           "type": "text",
           "label": "<br>Last Name",
           "placeholder": "",
           "fieldClass": "col-4 pull-left pr-0 no-wrap"
       },
       "email": {
           "type": "text",
           "label": "Email Address",
           "placeholder": ""
       },
     }
   }
 },

 Metadata:{},
 schema:{},
 schemas:['common', 'nih'],
 currentFormStep: 0,

 didInsertElement(){
   // TODO: more logic here to decide if there are any forms that need filled out
   //set the first schema from schemas list to the page
    this.set('schema', this.get(this.schemas[0]))

   // this block is a temp var till we figure out how  to get the right form to display
   /////
   let submission = this.get('model');
   var repos = submission.get('deposits').map(deposit => deposit.get('repo'));


   if (name === 'common' && repos.length) {
       return name;
   } else if (repos.includes(name)) {
       return name;
   }

 },
 actions: {
    nextForm(){
      if(this.get('currentFormStep') < this.get('schemas').length - 1) {
        this.set('schema', this.get(this.schemas[this.set('currentFormStep', this.get('currentFormStep') + 1)]))
      } else {
        // TODO: incriment the STEP counter on the workflow-wrapper
        this.sendAction('next')
      }
   },
   previousForm(){
     if(this.get('currentFormStep') !== 0) {
      this.set('schema', this.get(this.schemas[this.set('currentFormStep', this.get('currentFormStep') - 1)]))
    } else {
      // TODO: incriment the STEP counter on the workflow-wrapper
      this.sendAction('back')
    }
   }
 }
});
