import Component from '@ember/component';
import {
  Promise,
} from 'rsvp';

export default Component.extend({

  /** Holds all newly-added grants */
  addedGrants: [],
  optionalGrants: Ember.computed('model', function () {
    return this.get('model.grants');
  }),

  submissionGrants: Ember.computed('model.newSubmission', function () {
    return this.get('model.newSubmission.grants');
  }),

  actions: {
    next() {
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    addGrant(grant) {
      const submission = this.get('model.newSubmission');
      submission.get('grants').pushObject(grant);
      this.get('addedGrants').push(grant);
    },
    removeGrant(grant) {
      const submission = this.get('model.newSubmission');
      submission.get('grants').removeObject(grant);

      const index = this.get('addedGrants').indexOf(grant);
      this.get('addedGrants').splice(index, 1);
    },
    saveAll() {
      const grants = this.get('addedGrants');
      this.set('addedGrants', []);
      const submission = this.get('model.newSubmission');

      return Promise.all(grants.map((grant) => {
        grant.get('submissions').pushObject(submission);
        return grant.save();
      })).then(() => submission.save());
    },
  },
});
