import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({

  store: service('store'),

  actions: {

    newSubmission() {
      return this.get('store').createRecord('submission');
    },

    cancelSubmission(submission) {
      submission.rollbackAttributes();
    },

    saveSubmission(submission) {
      var grant = this.model;

      return submission.save().then(() => {
        submission.get('grants').pushObject(grant);
        submission.save();

        grant.get('submissions').pushObject(submission);
        grant.save();

        return submission;
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
