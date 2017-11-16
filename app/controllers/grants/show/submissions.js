import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  actions: {
    
        /** Create a new submission for the current grant */
        newSubmission() {
          return this.get('store').createRecord('submission');
        },
    
        /** Saves a new submission to the grant */
        addSubmission(submission) { 
          var grant = this.model;
    
          submission.save().then(() => {
            submission.get('grants').pushObject(grant);
            submission.save();

            grant.get('submissions').pushObject(submission);
            grant.save();
          });
        }
      },
  columns: [
    { propertyName: 'title', title: 'Title' },
    { propertyName: 'status', title: 'Status' },
    { propertyName: 'creationDate', title: 'Created' },
    { component: "submissions-action-cell", title: 'Actions' }
  ],

  themeInstance: Bootstrap4Theme.create()  
});
