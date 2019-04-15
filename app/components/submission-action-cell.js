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
     * Delete the specified submission record from Fedora.
     *
     * Note: `ember-fedora-adapter#deleteRecord` behaves like `ember-data#destroyRecord`
     * in that the deletion is pushed to the back end automatically, such that a
     * subsequent 'save()' will fail.
     *
     * @param {object} submission model object to be removed
     */
    deleteSubmission(submission) {
      submission.deleteRecord();
    }
  }
});
