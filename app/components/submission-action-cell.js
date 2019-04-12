import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service('current-user'),
  isPreparer: Ember.computed('currentUser', 'record', function () {
    let userId = this.get('currentUser.user.id');
    let preparers = this.get('record.preparers');
    return preparers.map(x => x.id).includes(userId);
  }),
  isSubmitter: Ember.computed('currentUser', 'record', function () {
    return this.get('currentUser.user.id') === this.get('record.submitter.id');
  }),
  submissionIsDraft: Ember.computed('record', function () {
    // TODO: after model update, we can just check if submission status === 'draft'
    // return this.get('record.submissinoStatus') === 'draft';
    return !this.get('record.submitted') && !this.get('record.submissionStatus');
  }),

  actions: {
    /**
     * TODO: when things are merged, call 'submission-handler' to remove this submission
     * @param {object} submission model object to be removed
     */
    deleteSubmission(submission) {
      console.log('Will delete submission');
      console.log(submission);
    }
  }
});
