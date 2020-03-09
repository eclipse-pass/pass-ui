import { computed } from '@ember/object';
import Controller from '@ember/controller';
import ENV from 'pass-ember/config/environment';
import { inject as service } from '@ember/service';
// import swal from 'sweetalert2';

export default Controller.extend({
  currentUser: service('current-user'),
  store: service('store'),
  submissionHandler: service('submission-handler'),
  searchHelper: service('search-helper'),

  tooltips: function () {
    $(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }.on('init'),

  externalSubmission: computed('externalSubmissionsMetadata', 'model.sub.submitted', function () {
    if (!this.get('model.sub.submitted')) {
      return [];
    }
    return this.get('externalSubmissionsMetadata') || [];
  }),
  /**
   * Ugly way to generate data for the template to use.
   * {
   *    'repository-id': {
   *      repo: { }, // repository obj
   *      deposit: {}, // related deposit, if exists
   *      repositoryCopy: {} // related repoCopy if exists
   *    }
   * }
   * This map is then turned into an array for use in the template
   */
  externalRepoMap: {},
  hasVisitedWeblink: computed('externalRepoMap', function () {
    return Object.values(this.get('externalRepoMap')).every(val => val === true);
  }),

  /**
   * Get enough information about 'web-link' repositories to display to a user.
   */
  externalSubmissionsMetadata: computed('model.sub.submitted', 'model.sub.repositories', function () {
    let result = [];

    this.get('model.sub.repositories').filter(repo => repo.get('_isWebLink'))
      .forEach((repo) => {
        result.push({
          message: `Deposit into ${repo.get('name')} was prompted`,
          name: repo.get('name'),
          url: repo.get('url')
        });
      });

    return result;
  }),

  weblinkRepos: computed('externalSubmissionsMetadata', function () {
    let md = this.get('externalSubmissionsMetadata');

    if (Array.isArray(md) && md.length > 0) {
      md.forEach((repo) => {
        this.get('externalRepoMap')[repo.name] = false;
      });
      return md;
    }

    return [];
  }),

  mustVisitWeblink: computed('weblinkRepos', 'model', function () {
    const weblinkExists = this.get('weblinkRepos').length > 0;
    const isSubmitter = this.get('currentUser.user.id') === this.get('model.sub.submitter.id');
    const isProxySubmission = this.get('model.sub.isProxySubmission');
    const isSubmitted = this.get('model.sub.submitted');
    return weblinkExists && isSubmitter && isProxySubmission && !isSubmitted;
  }),

  disableSubmit: computed(
    'mustVisitWeblink',
    'hasVisitedWeblink',
    function () {
      const needsToVisitWeblink = this.get('mustVisitWeblink') && !this.get('hasVisitedWeblink');
      return needsToVisitWeblink;
    }
  ),

  /**
   * Awkward object for use in the UI composing Repository objects with related
   * Deposit and RepositoryCopy objects.
   *
   * Explicitly exclude 'web-link' repositories.
   */
  repoMap: computed('model.deposits', 'model.repoCopies', function () {
    let hasStuff = false;
    const repos = this.get('model.repos');
    const deps = this.get('model.deposits');
    const repoCopies = this.get('model.repoCopies');
    if (!repos) {
      return null;
    }
    let map = {};
    repos.filter(repo => !repo.get('_isWebLink')).forEach((r) => {
      (map[r.get('id')] = {
        repo: r
      });
    });

    if (deps) {
      deps.forEach((deposit) => {
        hasStuff = true;
        const repo = deposit.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            deposit
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], {
            deposit,
            repositoryCopy: deposit.get('repositoryCopy')
          });
        }
      });
    }
    if (repoCopies) {
      hasStuff = true;
      repoCopies.forEach((rc) => {
        const repo = rc.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            repositoryCopy: rc
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], {
            repositoryCopy: rc
          });
        }
      });
    }
    if (hasStuff) {
      let results = [];
      Object.keys(map).forEach(k => results.push(map[k]));
      return results;
    }

    return null;
  }),

  isSubmitter: computed('currentUser.user', 'model', function () {
    return (
      this.get('model.sub.submitter.id') === this.get('currentUser.user.id')
    );
  }),

  isPreparer: computed('currentUser.user', 'model', function () {
    return this.get('model.sub.preparers')
      .map(x => x.get('id'))
      .includes(this.get('currentUser.user.id'));
  }),

  submissionNeedsPreparer: computed(
    'currentUser.user',
    'model',
    function () {
      return this.get('model.sub.submissionStatus') === 'changes-requested';
    }
  ),

  submissionNeedsSubmitter: computed(
    'currentUser.user',
    'model',
    'model.sub.submissionStatus',
    function () {
      return (
        this.get('model.sub.submissionStatus') === 'approval-requested' ||
        this.get('model.sub.submissionStatus') === 'approval-requested-newuser'
      );
    }
  ),

  displaySubmitterName: computed('model.sub', function () {
    if (this.get('model.sub.submitter.displayName')) {
      return this.get('model.sub.submitter.displayName');
    } else if (this.get('model.sub.submitter.firstName')) {
      return `${this.get('model.sub.submitter.firstName')} ${this.get('model.sub.submitter.lastName')}`;
    } else if (this.get('model.sub.submitterName')) {
      return this.get('model.sub.submitterName');
    }
    return '';
  }),

  displaySubmitterEmail: computed('model.sub', function () {
    if (this.get('model.sub.submitter.email')) {
      return this.get('model.sub.submitter.email');
    } else if (this.get('model.sub.submitterEmail')) {
      return this.get('model.sub.submitterEmailDisplay');
    }
    return '';
  }),

  actions: {
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
        this.get('externalRepoMap')[repo.name] = true;
        const allLinksVisited = Object.values(this.get('externalRepoMap')).every(val => val === true);
        if (allLinksVisited) {
          this.set('hasVisitedWeblink', true);
        }
        $('#externalSubmission').modal('hide');

        var win = window.open(repo.url, '_blank');
        win.focus();
      });
    },

    requestMoreChanges() {
      let sub = this.get('model.sub');
      let message = this.get('message');

      if (!message) {
        swal(
          'Comment field empty',
          'Please add a comment before requesting changes.',
          'warning'
        );
      } else {
        $('.block-user-input').css('display', 'block');
        this.get('submissionHandler').requestSubmissionChanges(sub, message).then(() => window.location.reload(true));
      }
    },

    async approveChanges() {
      let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');
      // First, check if user has visited all required weblinks.
      if (this.get('disableSubmit')) {
        if (!this.get('hasVisitedWeblink')) {
          $('.fa-exclamation-triangle').css('color', '#f86c6b');
          $('.fa-exclamation-triangle').css('font-size', '2.2em');
          setTimeout(() => {
            $('.fa-exclamation-triangle').css('color', '#b0b0b0');
            $('.fa-exclamation-triangle').css('font-size', '2em');
          }, 4000);
          toastr.warning('Please visit the listed web portal(s) to submit your manuscript directly. Metadata displayed on this page can be used to help in the submission process.');
        }
        return;
      }

      // Validate manuscript files
      let manuscriptFiles = [].concat(this.get('filesTemp'), this.get('model.files') && this.get('model.files').toArray())
        .filter(file => file && file.get('fileRole') === 'manuscript');

      if (manuscriptFiles.length == 0) {
        swal(
          'Manuscript is missing',
          'At least one manuscript file is required.  Please Edit the submission to add one',
          'warning'
        );
        return;
      } else if (manuscriptFiles.length > 1) {
        swal(
          'Incorrect manuscript count',
          `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please edit the file list`,
          'warning'
        );
        return;
      }

      let reposWithAgreementText = this.get('model.repos')
        .filter(repo => (!repo.get('_isWebLink')) && repo.get('agreementText'))
        .map(repo => ({
          id: repo.get('name'),
          title: `Deposit requirements for ${repo.get('name')}`,
          html: `<textarea rows="16" cols="40" name="embargo" class="alpaca-control form-control disabled" disabled="" autocomplete="off">${repo.get('agreementText')}</textarea>`
        }));

      let reposWithoutAgreementText = this.get('model.repos')
        .filter(repo => !repo.get('_isWebLink') && !repo.get('agreementText'))
        .map(repo => ({
          id: repo.get('name')
        }));

      let reposWithWebLink = this.get('model.repos')
        .filter(repo => repo.get('_isWebLink'))
        .map(repo => ({
          id: repo.get('name')
        }));

      const result = await swal.mixin({
        input: 'checkbox',
        inputPlaceholder: 'I agree to the above statement on today\'s date ',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
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
        if (this.get('model.sub.repositories.length') > 0) {
          if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length > 0 || reposWithWebLink.length > 0) {
            let swalMsg = 'Once you click confirm you will no longer be able to edit this submission or add repositories.<br/>';
            if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length) {
              swalMsg = `${swalMsg}You are about to submit your files to: <pre><code>${JSON.stringify(reposThatUserAgreedToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')}${JSON.stringify(reposWithoutAgreementText.map(repo => repo.id)).replace(/[\[\]']/g, '')} </code></pre>`;
            }
            if (reposWithWebLink.length > 0) {
              swalMsg = `${swalMsg}You were prompted to submit to: <code><pre>${JSON.stringify(reposWithWebLink.map(repo => repo.id)).replace(/[\[\]']/g, '')}</code></pre>`;
            }

            swal({
              title: 'Confirm submission',
              html: swalMsg, // eslint-disable-line
              confirmButtonText: 'Confirm',
              showCancelButton: true,
            }).then((result) => {
              if (result.value) {
                // Update repos to reflect repos that user agreed to deposit.
                // Must keep web-link repos.
                this.set('model.sub.repositories', this.get('model.sub.repositories').filter((repo) => {
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

                let sub = this.get('model.sub');
                let message = this.get('message');
                this.get('submissionHandler').approveSubmission(sub, message);
              }
            });
          } else {
            // there were repositories, but the user didn't sign any of the agreements
            let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo) => {
              if (!reposThatUserAgreedToDeposit.includes(repo)) {
                return true;
              }
            });
            swal({
              title: 'Your submission cannot be submitted.',
              html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(reposUserDidNotAgreeToDeposit.map(repo => repo.id)).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted. \n You can either (a) cancel the submission or (b) return to the submission to provide required input and try again.`,
              confirmButtonText: 'Cancel submission',
              showCancelButton: true,
              cancelButtonText: 'Go back to edit information'
            }).then((result) => {
              if (result.value) {
                this.send('cancelSubmission');
              }
            });
          }
        } else {
          // no repositories associated with the submission
          swal({
            title: 'Your submission cannot be submitted.',
            html: 'No repositories are associated with this submission. \n You can either (a) cancel the submission or (b) return to the submission and edit it to include a repository.',
            confirmButtonText: 'Cancel submission',
            showCancelButton: true,
            cancelButtonText: 'Go back to edit information'
          }).then((result) => {
            if (result.value) {
              this.send('cancelSubmission');
            }
          });
        }
      }
    },

    cancelSubmission() {
      let message = this.get('message');
      let sub = this.get('model.sub');

      if (!message) {
        swal(
          'Comment field empty',
          'Please add a comment for your cancellation.',
          'warning'
        );
        return;
      }

      swal({
        title: 'Are you sure?',
        text: 'If you cancel this submission, it will not be able to be resumed.',
        confirmButtonText: 'Yes, cancel this submission',
        confirmButtonColor: '#f86c6b',
        cancelButtonText: 'Never mind',
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          $('.block-user-input').css('display', 'block');
          this.get('submissionHandler').cancelSubmission(sub, message).then(() => window.location.reload(true));
        }
      });
    },

    deleteSubmission(submission) {
      swal({
        text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#f86c6b',
        showCancelButton: true
      }).then((result) => {
        if (result.value) {
          const ignoreList = this.get('searchHelper');

          this.get('submissionHandler').deleteSubmission(submission).then(() => {
            ignoreList.clearIgnore();
            ignoreList.ignore(submission.get('id'));
            this.transitionToRoute('submissions');
          });
        }
      });
    }
  }
});
