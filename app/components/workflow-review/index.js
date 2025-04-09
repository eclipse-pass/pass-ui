/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { later } from '@ember/runloop';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';

/**
 * Present the user with a summary of all information known about the current in-progress
 * submission. Do not allow finalize & submit until web-link repositories have been visited.
 * On submit, the user is presented with all relevant repository agreements.
 *
 * TODO:
 * Note, in the current implementation, if a user were to back out of the workflow during
 * this step, then open it back up, they may have to interact with the web-link repositories
 * unnecesarily. We'd need proper state management to mark this to prevent the redundant
 * interaction
 */
export default class WorkflowReview extends Component {
  @service store;
  @service workflow;
  @service currentUser;
  @service flashMessages;

  @tracked isValidated = [];
  @tracked filesTemp = this.workflow.filesTemp;
  @tracked hasVisitedWeblink = false;
  @tracked repositories = this.args.submission.repositories;

  get parsedFiles() {
    return this.store.peekAll('file').filter((file) => file.submission.id === this.args.submission.id);
  }

  get weblinkRepos() {
    const webLinkRepos = this.repositories.filter((repo) => repo._isWebLink);

    return webLinkRepos;
  }

  get mustVisitWeblink() {
    const weblinkExists = this.weblinkRepos.length > 0;

    const isSubmitter = get(this, 'currentUser.user.id') === get(this, 'args.submission.submitter.id');
    return weblinkExists && isSubmitter;
  }

  get disableSubmit() {
    const needsToVisitWeblink = this.mustVisitWeblink && !this.hasVisitedWeblink;
    return this.args.uploading || needsToVisitWeblink;
  }

  get userIsPreparer() {
    const isNotSubmitter = get(this, 'args.submission.submitter.id') !== get(this, 'currentUser.user.id');
    return get(this, 'args.submission.isProxySubmission') && isNotSubmitter;
  }

  get submitButtonText() {
    return this.userIsPreparer ? 'Request approval' : 'Submit';
  }

  unblockUserInput() {
    const elements = document.querySelectorAll('.block-user-input');
    elements.forEach((el) => {
      el.style.display = 'none';
    });
  }

  @action
  onAllExternalReposClicked() {
    this.hasVisitedWeblink = true;
  }

  @task
  submitTask = function* () {
    $('.block-user-input').css('display', 'block');
    let disableSubmit = true;
    // In case a crafty user edits the page HTML, don't submit when not allowed
    if (this.disableSubmit) {
      if (!this.hasVisitedWeblink) {
        $('.fa-exclamation-triangle').css('color', '#DC3545');
        $('.fa-exclamation-triangle').css('font-size', '2.2em');
        later(() => {
          $('.fa-exclamation-triangle').css('color', '#b0b0b0');
          $('.fa-exclamation-triangle').css('font-size', '2em');
        }, 4000);
        this.flashMessages.warning(
          'Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.',
        );
      }
      disableSubmit = false;
    }

    if (!disableSubmit) {
      this.unblockUserInput();
      return;
    }

    if (get(this, 'args.submission.submitter.id') !== get(this, 'currentUser.user.id')) {
      this.args.submitSubmission();
      return;
    }

    // User is submitting on own behalf. Must get repository agreements.
    const repos = yield this.args.submission.repositories;
    if (repos.length === 0) {
      // no repositories associated with the submission
      swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: 'No repositories are associated with this submission. \n Return to the submission and edit it to include a repository.',
        confirmButtonText: 'Ok',
      });
      this.unblockUserInput();
      return;
    }

    let reposWithAgreementText = repos
      .filter((repo) => !repo._isWebLink && repo.agreementText)
      .map((repo) => ({
        id: repo.name,
        title: `Deposit requirements for ${repo.name}`,
        html: `<div class="form-control deposit-agreement-content py-4 mt-4">${repo.agreementText}</div>`,
      }));

    let reposWithoutAgreementText = repos
      .filter((repo) => !repo._isWebLink && !repo.agreementText)
      .map((repo) => ({
        id: repo.name,
      }));

    let reposWithWebLink = repos
      .filter((repo) => repo._isWebLink)
      .map((repo) => ({
        id: repo.name,
      }));

    const reposProgressSteps = reposWithAgreementText.map((repo, index) => index);
    const Queue = swal.mixin({
      target: ENV.APP.rootElement,
      confirmButtonText: 'Next &rarr;',
      input: 'radio',
      inputOptions: {
        agree: `I agree to the above statement on today's date.`,
        noAgree:
          'I do not agree to the above statement and I understand that if I proceed and do not check this box, my submission will not be deposited to the above repository.',
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to choose something!';
        }
      },
      progressSteps: reposProgressSteps.map((index) => '' + (index + 1)),
    });
    const result = { value: [] };
    for (const repoStep of reposProgressSteps) {
      const repoState = reposWithAgreementText[repoStep];
      const repoResult = yield Queue.fire({
        currentProgressStep: repoStep,
        title: repoState.title,
        html: repoState.html,
      });
      result.value.push(repoResult.value);
    }
    const validResults = result.value.some((agree) => agree !== undefined);
    if (!validResults && reposWithAgreementText.length > 0) {
      // User just closed dialog with repos with text agreements, don't do anything else
      this.unblockUserInput();
      return;
    }
    let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
      if (result.value[index] === 'agree') {
        return repo;
      }
    });
    if (
      reposWithoutAgreementText.length > 0 ||
      reposThatUserAgreedToDeposit.length > 0 ||
      reposWithWebLink.length > 0
    ) {
      let swalMsg =
        'Once you click confirm you will no longer be able to edit this submission or add repositories.<br/>';
      if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length) {
        swalMsg = `${swalMsg}You are about to submit your files to: <pre><code>${JSON.stringify(
          reposThatUserAgreedToDeposit.map((repo) => repo.id),
        ).replace(/[\[\]']/g, '')}${JSON.stringify(reposWithoutAgreementText.map((repo) => repo.id)).replace(
          /[\[\]']/g,
          '',
        )} </code></pre>`;
      }
      if (reposWithWebLink.length > 0) {
        swalMsg = `${swalMsg}You were prompted to submit to: <code><pre>${JSON.stringify(
          reposWithWebLink.map((repo) => repo.id),
        ).replace(/[\[\]']/g, '')}</code></pre>`;
      }

      const resultConfirm = yield swal.fire({
        target: ENV.APP.rootElement,
        title: 'Confirm submission',
        html: swalMsg, // eslint-disable-line
        confirmButtonText: 'Confirm',
        showCancelButton: true,
      });

      if (resultConfirm.value) {
        /*
         * Update repos to reflect repos that user agreed to deposit
         * It is assumed that the user has done the necessary steps for each web-link repository,
         * so those are also kept in the list
         */

        const repos = yield this.args.submission.repositories;

        const filteredRepos = repos.filter((repo) => {
          if (repo._isWebLink) {
            return true;
          }
          let temp = reposWithAgreementText.map((x) => x.id).includes(repo.name);
          if (!temp) {
            return true;
          } else if (reposThatUserAgreedToDeposit.map((r) => r.id).includes(repo.name)) {
            return true;
          }
          return false;
        });

        this.args.submission.repositories = filteredRepos;

        this.args.submitSubmission();
      } else {
        this.unblockUserInput();
      }
    } else {
      // there were repositories, but the user didn't sign any of the agreements
      let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo) => {
        if (!reposThatUserAgreedToDeposit.includes(repo)) {
          return true;
        }
      });
      swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(
          reposUserDidNotAgreeToDeposit.map((repo) => repo.id),
        ).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted.`,
        confirmButtonText: 'Ok',
      });
      this.unblockUserInput();
    }
  };

  @action
  initializeTooltip() {
    if (document.querySelector('[data-toggle="tooltip"]')) {
      document.querySelector('[data-toggle="tooltip"]').tooltip();
    }
  }

  @action
  agreeToDeposit() {
    set('step', 5);
  }

  @action
  openWeblinkAlert(repo) {
    swal
      .fire({
        target: ENV.APP.rootElement,
        title: 'Notice!',
        text: 'You are being sent to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Open new tab',
      })
      .then((value) => {
        if (value.dismiss) {
          // Don't redirect
          return;
        }
        // Go to the weblink repo
        this.externalRepoMap[repo.id] = true;
        const allLinksVisited = Object.values(this.externalRepoMap).every((val) => val === true);
        if (allLinksVisited) {
          this.hasVisitedWeblink = true;
        }
        $('#externalSubmission').modal('hide');
        var win = window.open(repo.url, '_blank');
        if (win) {
          win.focus();
        }
      });
  }

  @action
  back() {
    this.args.back();
  }

  @action
  cancel() {
    this.args.abort();
  }
}
