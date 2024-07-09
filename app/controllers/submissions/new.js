/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import ENV from 'pass-ui/config/environment';

export default class SubmissionsNew extends Controller {
  queryParams = ['grant', 'submission', 'covid'];
  @service currentUser;
  @service workflow;
  @service submissionHandler;
  @service searchHelper;
  @service flashMessages;
  @service router;
  @service store;

  @tracked comment = ''; // Holds the comment that will be added to submissionEvent in the review step.
  @tracked uploading = false;
  @tracked waitingMessage = '';
  @tracked user = this.currentUser.user;
  @tracked submitter = this.model.newSubmission.submitter;
  @tracked covid = null;
  @tracked filesTemp = this.workflow.filesTemp;

  async userIsSubmitter() {
    const submitter = await this.model.newSubmission.submitter;
    return submitter?.id === this.user.id;
  }

  /**
   * Adds the covid hint if it does not exist and removes it if it does depending on the
   * event emitted form the covid checkbox. also handles cases where there may be other
   * hints in the collection tags on the metadata object
   *
   * Note, that if this method is used from the files or review steps (post metadata
   * validation on the details step) there is not additional metadata validation
   * that occurs prior to submission.
   */
  @action
  updateCovidSubmission() {
    let selectedCovid = event.target.checked;
    let submission = this.model.newSubmission;
    let metadata = submission.metadata ? JSON.parse(submission.metadata) : {};

    if (selectedCovid && !submission.isCovid) {
      let covidHint = {
        'collection-tags': ['covid'],
      };

      if ('hints' in metadata) {
        let tags = metadata.hints['collection-tags'];

        if (tags.includes('covid')) return;

        metadata.hints['collection-tags'].push('covid');
      } else {
        metadata.hints = covidHint;
      }
    }

    if (!selectedCovid && submission.isCovid) {
      if ('hints' in metadata) {
        let tags = metadata.hints['collection-tags'];

        if (tags.length > 1) {
          let tagsWithoutCovid = tags.filter((tag) => tag != 'covid');
          metadata.hints['collection-tags'] = tagsWithoutCovid;
        }

        if (tags.length === 1) {
          delete metadata.hints;
        }
      } else {
        return;
      }
    }

    set(submission, 'metadata', JSON.stringify(metadata));
  }

  @action
  async submit() {
    let manuscriptFiles = []
      .concat(this.filesTemp, this.model.files && this.model.files.slice(), this.store.peekAll('file'))
      .filter((file) => file && file.fileRole === 'manuscript')
      .filter((file) => file.submission.id === this.model.newSubmission.id);

    manuscriptFiles = _.uniqBy(manuscriptFiles, 'id');

    const submitter = await this.userIsSubmitter();
    if (manuscriptFiles.length == 0 && submitter) {
      swal('Manuscript Is Missing', 'At least one manuscript file is required.  Please go back and add one', 'warning');
    } else if (manuscriptFiles.length > 1) {
      swal(
        'Incorrect Manuscript Count',
        `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please go back and edit the file list`,
        'warning',
      );
    } else {
      let sub = this.model.newSubmission;
      let pub = this.model.publication;
      let files = this.filesTemp;
      let comment = this.comment;

      this.set('uploading', true);
      this.set('waitingMessage', 'Saving your submission');

      await this.submissionHandler.submit
        .perform(sub, pub, files, comment)
        .then(() => {
          set(this, 'uploading', false);
          set(this, 'comment', '');
          set(this, 'workflow.filesTemp', []);
          this.router.transitionTo('thanks', { queryParams: { submission: sub.id } });
        })
        .catch((error) => {
          this.set('uploading', false);

          console.error(error.stack);
          this.flashMessages.danger(`Submission failed: ${error.message}`);

          const elements = document.querySelectorAll('.block-user-input');
          elements.forEach((el) => {
            el.style.display = 'none';
          });
        });
    }
  }

  @action
  async abort() {
    const submission = this.model.newSubmission;
    const ignoreList = this.searchHelper;

    let result = await swal({
      target: ENV.APP.rootElement,
      title: 'Discard Draft',
      text: "This will abort the current submission and discard progress you've made. This cannot be undone.",
      confirmButtonText: 'Abort',
      confirmButtonColor: '#DC3545',
      showCancelButton: true,
    });

    if (result.value) {
      ignoreList.clearIgnore();
      if (submission.id) {
        await this.submissionHandler.deleteSubmission(submission);
        ignoreList.ignore(submission.id);
      }
      this.router.transitionTo('submissions');
    }
  }
}
