import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import swal from 'sweetalert2';

export default Component.extend({
  currentUser: service('current-user'),
  submissionHandler: service('submission-handler'),

  isPreparer: computed('currentUser', 'record', function () {
    let userId = this.get('currentUser.user.id');
    let preparers = this.get('record.preparers');
    return preparers.map(x => x.id).includes(userId);
  }),
  isSubmitter: computed('currentUser', 'record', function () {
    return this.get('currentUser.user.id') === this.get('record.submitter.id');
  }),

  submissionIsDraft: computed('record', function () {
    return this.get('record.isDraft');
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
      swal({
        // title: 'Are you sure?',
        text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#f86c6b',
        showCancelButton: true,
        // buttonsStyling: false,
        // confirmButtonClass: 'btn btn-danger',
        // cancelButtonText: 'No',
        // customClass: {
        //   confirmButton: 'btn btn-danger'
        // }
      }).then((result) => {
        if (result.value) {
          this.get('submissionHandler').deleteSubmission(submission);
        }
      });
    }
  }
});
