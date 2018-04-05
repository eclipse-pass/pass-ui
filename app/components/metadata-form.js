import Component from '@ember/component';
import Ember from 'ember';

//parms: takes in a schema

export default Ember.Component.extend({
  // session: Ember.inject.service(),
  // store: Ember.inject.service(),
  // metaDataString: Ember.computed('output', function() {
  //   return JSON.stringify(this.get('output'));
  // }),
  didRender () {


    const that = this;
    let originalForm = this.get('input');
    let newForm = JSON.parse(JSON.stringify(originalForm));
    if (!originalForm.options) {
      newForm['options'] = {};
    }
    if (!originalForm['view']) {
    //  newForm['view'] = 'web-edit';
    }

    //Populate form with data if there is any to populate with.
    let metadata = this.get('model.metadata')
    if(!metadata) {
        metadata = []
    }else {
      if( metadata[this.currentFormStep]){
        newForm.data = metadata[this.currentFormStep].data
      }
    }
    // form ctrls
    newForm.options.form = {
      "buttons": {
        "Next": {
          "label": "Next",
          "styles": "pull-right btn btn-primary",
          "click": function() {
            let value = this.getValue();
            let formId = newForm.id
            if(!metadata[formId]){
              metadata.push({
                id: formId,
                data: value
               })
            } else {
              metadata[formId] = ({
                id: formId,
                data: value
              })
            }
            that.set('model.metadata', metadata)
            that.nextForm()
          }
        },
        "Back": {
            "title": "Back",
            "click": function() {
              that.previousForm()
            }
        }
      }
    };

    $(document).ready(() => {
      $("#schemaForm").empty();
      $("#schemaForm").alpaca(newForm);
    });
  },
  actions: {
    nextForm(){
     this.sendAction('nextForm')
   },
   previousForm(){
     this.sendAction('previousForm')
   }
  },
});
