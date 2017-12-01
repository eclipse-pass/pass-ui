import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({

  store: service('store'),

  saveWithGrant(submission) {
    console.log("Saved with " + submission);
  },

  createAndEditSubmission(submission) {
    this.saveWithGrant(submission);
  },

  saveAndCloseSubmission(submission) {
    this.saveWithGrant(submission);
  },


  newSubmission() {
    console.log("new submission");
    return this.get('store').createRecord('submission', { title: "yo " + Math.random() });
  },

  actions: {

    cancelSubmission(submission) {
      submission.rollbackAttributes();
    },

    saveSubmission(submission) {
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
