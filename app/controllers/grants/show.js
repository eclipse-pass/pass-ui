import Controller from '@ember/controller';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({
  actions: {
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
    { propertyName: 'creationDate', title: 'Created' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
