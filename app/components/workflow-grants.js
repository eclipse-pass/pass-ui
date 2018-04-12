import Component from '@ember/component';
import {
  Promise
} from 'rsvp';

export default Component.extend({

  /** Holds all newly-added grants */
  addedGrants: [],
  optionalGrants: Ember.computed('model', function() {
    return this.get('model.grants');
  }),

  submissionGrants: Ember.computed('model.newSubmission', function() {
    return this.get('model.newSubmission.grants');
  }),

  actions: {
    next() {
      this.sendAction('next')
    },
    back() {
      this.sendAction('back')
    },
    addGrant(grant) {
      var submission = this.get('model.newSubmission');
      submission.get('grants').pushObject(grant);
      this.get('addedGrants').push(grant);
    },
    removeGrant(grant) {
      var submission = this.get('model.newSubmission');
      submission.get('grants').removeObject(grant);

      var index = this.get('addedGrants').indexOf(grant);
      this.get('addedGrants').splice(index, 1);
    },
    saveAll() {
      var grants = this.get('addedGrants');
      this.set('addedGrants', []);
      var submission = this.get('model.newSubmission');

      return Promise.all(grants.map(grant => {
        grant.get('submissions').pushObject(submission);
        return grant.save();
      })).then(() => submission.save());
    }
  },
});
