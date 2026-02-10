/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';
import type CurrentUserService from 'pass-ui/services/current-user';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type SearchHelperService from 'pass-ui/services/search-helper';

export default class SubmissionsNew extends Controller {
  queryParams: string[] = ['grant', 'submission', 'covid'];
  @service declare currentUser: CurrentUserService;
  @service declare workflow: Workflow;
  @service declare submissionHandler: SubmissionHandlerService;
  @service declare searchHelper: SearchHelperService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @tracked comment: string = ''; // Holds the comment that will be added to submissionEvent in the review step.
  @tracked uploading: boolean = false;
  @tracked waitingMessage: string = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked user: any = this.currentUser.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked submitter: any = this.model.newSubmission.submitter;
  @tracked covid: string | null = null;

  async userIsSubmitter(): Promise<boolean> {
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
  updateCovidSubmission(): void {
    const selectedCovid = event.target.checked;
    const submission = this.model.newSubmission;
    const metadata = submission.metadata ? JSON.parse(submission.metadata) : {};

    if (selectedCovid && !submission.isCovid) {
      const covidHint = {
        'collection-tags': ['covid'],
      };

      if ('hints' in metadata) {
        const tags = metadata.hints['collection-tags'];

        if (tags.includes('covid')) return;

        metadata.hints['collection-tags'].push('covid');
      } else {
        metadata.hints = covidHint;
      }
    }

    if (!selectedCovid && submission.isCovid) {
      if ('hints' in metadata) {
        const tags = metadata.hints['collection-tags'];

        if (tags.length > 1) {
          const tagsWithoutCovid = tags.filter((tag: string) => tag != 'covid');
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
  async submit(): Promise<void> {
    let manuscriptFiles = this.workflow
      .getFiles()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((file: any) => file && file.fileRole === 'manuscript')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((file: any) => file.submission.id === this.model.newSubmission.id);

    manuscriptFiles = _.uniqBy(manuscriptFiles, 'id');

    const submitter = await this.userIsSubmitter();
    if (manuscriptFiles.length == 0 && submitter) {
      swal.fire(
        'Manuscript Is Missing',
        'At least one manuscript file is required.  Please go back and add one',
        'warning',
      );
    } else if (manuscriptFiles.length > 1) {
      swal.fire(
        'Incorrect Manuscript Count',
        `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please go back and edit the file list`,
        'warning',
      );
    } else {
      const sub = this.model.newSubmission;
      const pub = this.model.publication;
      const comment = this.comment;

      this.set('uploading', true);
      this.set('waitingMessage', 'Saving your submission');

      await this.submissionHandler.submit
        .perform(sub, pub, comment)
        .then(() => {
          set(this, 'uploading', false);
          set(this, 'comment', '');
          set(this, 'workflow.files', []);
          this.router.transitionTo('thanks', { queryParams: { submission: sub.id } });
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          this.set('uploading', false);

          console.error(error.stack);
          this.flashMessages.danger(`Submission failed: ${error.message}`);

          const elements = document.querySelectorAll('.block-user-input');
          elements.forEach((el: HTMLElement) => {
            el.style.display = 'none';
          });
        });
    }
  }

  @action
  async abort(): Promise<void> {
    const submission = this.model.newSubmission;
    const ignoreList = this.searchHelper;

    const result = await swal.fire({
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
