import { A } from '@ember/array';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({
  queryParams: ['grant', 'submission'],
  currentUser: service('current-user'),
  workflow: service('workflow'),
  submissionHandler: service('submission-handler'),
  searchHelper: service('search-helper'),

  comment: '', // Holds the comment that will be added to submissionEvent in the review step.
  uploading: false,
  waitingMessage: '',

  filesTemp: computed('workflow.filesTemp', {
    get(key) {
      return this.get('workflow').getFilesTemp();
    },
    set(key, value) {
      this.get('workflow').setFilesTemp(value);
      return value;
    }
  }),
  userIsSubmitter: computed(
    'currentUser.user',
    'model.newSubmission.submitter',
    function () {
      return (
        this.get('model.newSubmission.submitter.id') ===
        this.get('currentUser.user.id')
      );
    }
  ),
  actions: {
    submit() {
      let manuscriptFiles = [].concat(this.get('filesTemp'), this.get('model.files') && this.get('model.files').toArray())
        .filter(file => file && file.get('fileRole') === 'manuscript');

      if (manuscriptFiles.length == 0 && this.get('userIsSubmitter')) {
        swal(
          'Manuscript Is Missing',
          'At least one manuscript file is required.  Please go back and add one',
          'warning'
        );
      } else if (manuscriptFiles.length > 1) {
        swal(
          'Incorrect Manuscript Count',
          `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please go back and edit the file list`,
          'warning'
        );
      } else {
        let sub = this.get('model.newSubmission');
        let pub = this.get('model.publication');
        let files = this.get('filesTemp');
        let comment = this.get('comment');

        this.set('uploading', true);
        this.set('waitingMessage', 'Saving your submission');

        this.get('submissionHandler.submit').perform(sub, pub, files, comment).catch((error) => {
          this.set('uploading', false);
          toastr.error(`Submission failed: ${error.message}`);
        }).then(() => {
          this.set('uploading', false);
          this.set('filesTemp', A());
          this.set('comment', '');
          this.transitionToRoute('thanks', { queryParams: { submission: sub.get('id') } });
        });
      }
    },
    abort() {
      const submission = this.get('model.newSubmission');
      const ignoreList = this.get('searchHelper');

      swal({
        title: 'Discard Draft',
        text: 'This will abort the current submission and discard progress you\'ve made. This cannot be undone.',
        confirmButtonText: 'Abort',
        confirmButtonColor: '#f86c6b',
        showCancelButton: true
      }).then(async (result) => {
        if (result.value) {
          await this.get('submissionHandler').deleteSubmission(submission);
          // Clear the shared ignore list, then add the 'deleted' submission ID
          ignoreList.clearIgnore();
          ignoreList.ignore(submission.get('id'));
          this.transitionToRoute('submissions');
        }
      });
    }
  }
});
