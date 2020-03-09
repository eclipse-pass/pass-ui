import { computed } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  workflow: service('workflow'),
  currentUser: service('current-user'),
  isValidated: A(),
  init() {
    this._super(...arguments);
    $('[data-toggle="tooltip"]').tooltip();
  },
  externalRepoMap: {},
  filesTemp: computed('workflow.filesTemp', function () {
    return this.get('workflow').getFilesTemp();
  }),
  parsedFiles: computed('filesTemp', 'previouslyUploadedFiles', function () {
    let newArr = A();
    if (this.get('filesTemp')) {
      newArr.addObjects(this.get('filesTemp'));
    }
    if (this.get('previouslyUploadedFiles')) {
      newArr.addObjects(this.get('previouslyUploadedFiles'));
    }
    return newArr;
  }),

  hasVisitedWeblink: computed('externalRepoMap', function () {
    return Object.values(this.get('externalRepoMap')).every(val => val === true);
  }),
  weblinkRepos: computed('submission.repositories', function () {
    const repos = this.get('submission.repositories').filter(repo => repo.get('_isWebLink'));
    repos.forEach(repo => (this.get('externalRepoMap')[repo.get('id')] = false)); // eslint-disable-line
    return repos;
  }),
  mustVisitWeblink: computed('weblinkRepos', 'model', function () {
    const weblinkExists = this.get('weblinkRepos.length') > 0;
    const isSubmitter = this.get('currentUser.user.id') === this.get('submission.submitter.id');
    return weblinkExists && isSubmitter;
  }),
  disableSubmit: computed('mustVisitWeblink', 'hasVisitedWeblink', function () {
    const needsToVisitWeblink = this.get('mustVisitWeblink') && !this.get('hasVisitedWeblink');
    return needsToVisitWeblink;
  }),
  userIsPreparer: computed('submission', 'currentUser.user', function () {
    const isNotSubmitter = this.get('submission.submitter.id') !== this.get('currentUser.user.id');
    return (this.get('submission.isProxySubmission') && isNotSubmitter);
  }),
  submitButtonText: computed('userIsPreparer', function () {
    return this.get('userIsPreparer') ? 'Request approval' : 'Submit';
  }),

  submitTask: task(function* () {
    $('.block-user-input').css('display', 'block');
    let disableSubmit = true;
    // In case a crafty user edits the page HTML, don't submit when not allowed
    if (this.get('disableSubmit')) {
      if (!this.get('hasVisitedWeblink')) {
        $('.fa-exclamation-triangle').css('color', '#f86c6b');
        $('.fa-exclamation-triangle').css('font-size', '2.2em');
        setTimeout(() => {
          $('.fa-exclamation-triangle').css('color', '#b0b0b0');
          $('.fa-exclamation-triangle').css('font-size', '2em');
        }, 4000);
        toastr.warning('Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.');
      }
      disableSubmit = false;
    }

    if (!disableSubmit) {
      $('.block-user-input').css('display', 'none');
      return;
    }

    if (this.get('submission.submitter.id') !== this.get('currentUser.user.id')) {
      this.sendAction('submit');
      return;
    }

    // User is submitting on own behalf. Must get repository agreements.
    let reposWithAgreementText = this.get('submission.repositories')
      .filter(repo => (!repo.get('_isWebLink')) && repo.get('agreementText'))
      .map(repo => ({
        id: repo.get('name'),
        title: `Deposit requirements for ${repo.get('name')}`,
        html: `<div class="form-control deposit-agreement-content py-4 mt-4">${repo.get('agreementText')}</div>`
      }));

    let reposWithoutAgreementText = this.get('submission.repositories')
      .filter(repo => !repo.get('_isWebLink') && !repo.get('agreementText'))
      .map(repo => ({
        id: repo.get('name')
      }));

    let reposWithWebLink = this.get('submission.repositories')
      .filter(repo => repo.get('_isWebLink'))
      .map(repo => ({
        id: repo.get('name')
      }));

    const result = yield swal.mixin({
      input: 'checkbox',
      inputPlaceholder: 'I agree to the above statement on today\'s date ',
      confirmButtonText: 'Next &rarr;',
      progressSteps: reposWithAgreementText.map((repo, index) => index + 1),
    }).queue(reposWithAgreementText);
    if (result.value) {
      let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
        // if the user agreed to depost to this repo === 1
        if (result.value[index] === 1) {
          return repo;
        }
      });
      // make sure there are repos to submit to.
      if (this.get('submission.repositories.length') > 0) {
        if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length > 0 || reposWithWebLink.length > 0) {
          let swalMsg = 'Once you click confirm you will no longer be able to edit this submission or add repositories.<br/>';
          if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length) {
            swalMsg = `${swalMsg}You are about to submit your files to: <pre><code>${JSON.stringify(reposThatUserAgreedToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')}${JSON.stringify(reposWithoutAgreementText.map(repo => repo.id)).replace(/[\[\]']/g, '')} </code></pre>`;
          }
          if (reposWithWebLink.length > 0) {
            swalMsg = `${swalMsg}You were prompted to submit to: <code><pre>${JSON.stringify(reposWithWebLink.map(repo => repo.id)).replace(/[\[\]']/g, '')}</code></pre>`;
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
            this.set('submission.repositories', this.get('submission.repositories').filter((repo) => {
              if (repo.get('_isWebLink')) {
                return true;
              }
              let temp = reposWithAgreementText.map(x => x.id).includes(repo.get('name'));
              if (!temp) {
                return true;
              } else if (reposThatUserAgreedToDeposit.map(r => r.id).includes(repo.get('name'))) {
                return true;
              }
              return false;
            }));

            $('.block-user-input').css('display', 'block');

            this.sendAction('submit');
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
            html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(reposUserDidNotAgreeToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted.`,
            confirmButtonText: 'Ok',
          });
        }
      } else {
        // no repositories associated with the submission
        swal({
          title: 'Your submission cannot be submitted.',
          html: 'No repositories are associated with this submission. \n Return to the submission and edit it to include a repository.',
          confirmButtonText: 'Ok',
        });
      }
    }
  }),

  actions: {
    agreeToDeposit() { this.set('step', 5); },
    back() { this.sendAction('back'); },
    openWeblinkAlert(repo) {
      swal({
        title: 'Notice!',
        text:
          'You are being sent to an external site. This will open a new tab.',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Open new tab'
      }).then((value) => {
        if (value.dismiss) {
          // Don't redirect
          return;
        }
        // Go to the weblink repo
        this.get('externalRepoMap')[repo.get('id')] = true;
        const allLinksVisited = Object.values(this.get('externalRepoMap')).every(val => val === true);
        if (allLinksVisited) {
          this.set('hasVisitedWeblink', true);
        }
        $('#externalSubmission').modal('hide');

        var win = window.open(repo.get('url'), '_blank');

        if (win) {
          win.focus();
        }
      });
    },
    cancel() {
      this.sendAction('abort');
    }
  }
});
