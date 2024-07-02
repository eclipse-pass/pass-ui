/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { later } from '@ember/runloop';

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
  @service workflow;
  @service currentUser;
  @service flashMessages;

  @tracked isValidated = [];
  @tracked filesTemp = this.workflow.filesTemp;
  @tracked hasVisitedWeblink = false;
  @tracked repositories = this.args.submission.repositories;

  get parsedFiles() {
    let newArr = [];
    if (this.filesTemp) {
      newArr = [...this.filesTemp, ...newArr];
    }
    if (this.args.previouslyUploadedFiles) {
      newArr = [...this.args.previouslyUploadedFiles, ...newArr];
    }

    return newArr;
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
      const elements = document.querySelectorAll('.block-user-input');
      elements.forEach((el) => {
        el.style.display = 'none';
      });
      return;
    }

    if (get(this, 'args.submission.submitter.id') !== get(this, 'currentUser.user.id')) {
      this.args.submitSubmission();
      return;
    }

    // User is submitting on own behalf. Must get repository agreements.
    const repos = yield this.args.submission.repositories;
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

    const result = yield swal
      .mixin({
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
        progressSteps: reposWithAgreementText.map((repo, index) => index + 1),
      })
      .queue(reposWithAgreementText);
    if (result.value) {
      let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
        // if the user agreed to depost to this repo === 1
        if (result.value[index] === 'agree') {
          return repo;
        }
      });
      // make sure there are repos to submit to.
      if (get(this, 'args.submission.repositories.length') > 0) {
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

          const result = yield swal({
            title: 'Confirm submission',
            html: swalMsg, // eslint-disable-line
            confirmButtonText: 'Confirm',
            showCancelButton: true,
          });

          if (result.value) {
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
            const elements = document.querySelectorAll('.block-user-input');
            elements.forEach((el) => {
              el.style.display = 'none';
            });
          }
        } else {
          // there were repositories, but the user didn't sign any of the agreements
          let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo) => {
            if (!reposThatUserAgreedToDeposit.includes(repo)) {
              return true;
            }
          });
          swal({
            title: 'Your submission cannot be submitted.',
            html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(
              reposUserDidNotAgreeToDeposit.map((repo) => repo.id),
            ).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted.`,
            confirmButtonText: 'Ok',
          });
          const elements = document.querySelectorAll('.block-user-input');
          elements.forEach((el) => {
            el.style.display = 'none';
          });
        }
      } else {
        // no repositories associated with the submission
        swal({
          title: 'Your submission cannot be submitted.',
          html: 'No repositories are associated with this submission. \n Return to the submission and edit it to include a repository.',
          confirmButtonText: 'Ok',
        });
        const elements = document.querySelectorAll('.block-user-input');
        elements.forEach((el) => {
          el.style.display = 'none';
        });
      }
    } else {
      // User has cancelled out of the popup
      const elements = document.querySelectorAll('.block-user-input');
      elements.forEach((el) => {
        el.style.display = 'none';
      });
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
    swal({
      title: 'Notice!',
      text: 'You are being sent to an external site. This will open a new tab.',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Open new tab',
    }).then((value) => {
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
