/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { later } from '@ember/runloop';
import ENV from 'pass-ui/config/environment';

export default class WorkflowReview extends Component {
  @service workflow;
  @service currentUser;
  @service flashMessages;

  @tracked isValidated = A();
  @tracked externalRepoMap = {};
  @tracked filesTemp = this.workflow.filesTemp;
  @tracked _hasVisitedWeblink = null;

  get parsedFiles() {
    let newArr = A();
    if (this.filesTemp) {
      newArr.addObjects(this.filesTemp);
    }
    if (this.args.previouslyUploadedFiles) {
      newArr.addObjects(this.args.previouslyUploadedFiles);
    }
    return newArr;
  }

  get hasVisitedWeblink() {
    if (this._hasVisitedWeblink) {
      return this._hasVisitedWeblink;
    }
    return Object.values(this.externalRepoMap).every((val) => val === true);
  }

  set hasVisitedWeblink(value) {
    this._hasVisitedWeblink = value;
  }

  get weblinkRepos() {
    const repos = get(this, 'args.submission.repositories').filter((repo) => repo.get('_isWebLink'));
    repos.forEach((repo) => (this.externalRepoMap[repo.get('id')] = false)); // eslint-disable-line
    return repos;
  }

  get mustVisitWeblink() {
    const weblinkExists = get(this, 'weblinkRepos.length') > 0;
    const isSubmitter = get(this, 'currentUser.user.id') === get(this, 'args.submission.submitter.id');
    return weblinkExists && isSubmitter;
  }

  get disableSubmit() {
    const needsToVisitWeblink = this.mustVisitWeblink && !this.hasVisitedWeblink;
    return needsToVisitWeblink;
  }

  get userIsPreparer() {
    const isNotSubmitter = get(this, 'args.submission.submitter.id') !== get(this, 'currentUser.user.id');
    return get(this, 'args.submission.isProxySubmission') && isNotSubmitter;
  }

  get submitButtonText() {
    return this.userIsPreparer ? 'Request approval' : 'Submit';
  }

  get isTest() {
    return ENV.environment === 'test';
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
          'Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.'
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
      this.args.submit();
      return;
    }

    // User is submitting on own behalf. Must get repository agreements.
    let reposWithAgreementText = get(this, 'args.submission.repositories')
      .filter((repo) => !repo.get('_isWebLink') && repo.get('agreementText'))
      .map((repo) => ({
        id: repo.get('name'),
        title: `Deposit requirements for ${repo.get('name')}`,
        html: `<div class="form-control deposit-agreement-content py-4 mt-4">${repo.get('agreementText')}</div>`,
      }));

    let reposWithoutAgreementText = get(this, 'args.submission.repositories')
      .filter((repo) => !repo.get('_isWebLink') && !repo.get('agreementText'))
      .map((repo) => ({
        id: repo.get('name'),
      }));

    let reposWithWebLink = get(this, 'args.submission.repositories')
      .filter((repo) => repo.get('_isWebLink'))
      .map((repo) => ({
        id: repo.get('name'),
      }));

    const result = yield swal
      .mixin({
        input: 'checkbox',
        inputPlaceholder:
          "I agree to the above statement on today's date. I understand that if I proceed and do not check this box, my submission will not be deposited to above repository.",
        confirmButtonText: 'Next &rarr;',
        progressSteps: reposWithAgreementText.map((repo, index) => index + 1),
      })
      .queue(reposWithAgreementText);
    if (result.value) {
      let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
        // if the user agreed to depost to this repo === 1
        if (result.value[index] === 1) {
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
              reposThatUserAgreedToDeposit.map((repo) => repo.id)
            ).replace(/[\[\]']/g, '')}${JSON.stringify(reposWithoutAgreementText.map((repo) => repo.id)).replace(
              /[\[\]']/g,
              ''
            )} </code></pre>`;
          }
          if (reposWithWebLink.length > 0) {
            swalMsg = `${swalMsg}You were prompted to submit to: <code><pre>${JSON.stringify(
              reposWithWebLink.map((repo) => repo.id)
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
            set(
              this,
              'args.submission.repositories',
              get(this, 'args.submission.repositories').filter((repo) => {
                if (repo.get('_isWebLink')) {
                  return true;
                }
                let temp = reposWithAgreementText.map((x) => x.id).includes(repo.get('name'));
                if (!temp) {
                  return true;
                } else if (reposThatUserAgreedToDeposit.map((r) => r.id).includes(repo.get('name'))) {
                  return true;
                }
                return false;
              })
            );

            this.args.submit();
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
              reposUserDidNotAgreeToDeposit.map((repo) => repo.id)
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
      this.externalRepoMap[repo.get('id')] = true;
      const allLinksVisited = Object.values(this.externalRepoMap).every((val) => val === true);
      if (allLinksVisited) {
        this.hasVisitedWeblink = true;
      }
      $('#externalSubmission').modal('hide');

      var win = window.open(repo.get('url'), '_blank');

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
