/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies, ember/use-brace-expansion, ember/no-side-effects, ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, computed } from '@ember/object';
import ENV from 'pass-ui/config/environment';
import { inject as service } from '@ember/service';
import { later, scheduleOnce } from '@ember/runloop';
import _ from 'lodash';
import swal from 'sweetalert2/dist/sweetalert2.js';

export default class SubmissionsDetail extends Controller {
  @service currentUser;
  @service store;
  @service submissionHandler;
  @service searchHelper;
  @service flashMessages;
  @service router;

  constructor() {
    super(...arguments);

    let element = document.querySelector('[data-toggle="tooltip"]');
    if (element) element.tooltip();
  }

  @tracked submitted = get(this, 'model.sub.submitted');
  @tracked repositories = get(this, 'model.sub.repositories');
  @tracked externalRepoMap = {};
  @tracked _hasVisitedWeblink = null;

  @computed('model.files')
  get submissionFiles() {
    return get(this, 'model.files');
  }

  @computed('model.sub', 'model.sub.submitter.firstName')
  get displaySubmitterName() {
    if (get(this, 'model.sub.submitter.displayName')) {
      return get(this, 'model.sub.submitter.displayName');
    } else if (get(this, 'model.sub.submitter.firstName')) {
      return `${get(this, 'model.sub.submitter.firstName')} ${get(this, 'model.sub.submitter.lastName')}`;
    } else if (get(this, 'model.sub.submitterName')) {
      return get(this, 'model.sub.submitterName');
    }

    return '';
  }

  @computed('model.sub', 'model.sub.submitter.email')
  get displaySubmitterEmail() {
    if (get(this, 'model.sub.submitter.email')) {
      return get(this, 'model.sub.submitter.email');
    } else if (get(this, 'model.sub.submitterEmail')) {
      return get(this, 'model.sub.submitterEmailDisplay');
    }

    return '';
  }

  get externalSubmission() {
    let result = [];

    const processExternalSubmissionsMetadata = () => {
      result = this.externalSubmissionsMetadata;
    };

    if (this.submitted) {
      scheduleOnce('afterRender', this, processExternalSubmissionsMetadata);
    }

    return result;
  }

  /**
   * Ugly way to generate data for the template to use.
   * {
   *    'url': {
   *      repo: { }, // repository obj
   *      deposit: {}, // related deposit, if exists
   *      repositoryCopy: {} // related repoCopy if exists
   *    }
   * }
   * This map is then turned into an array for use in the template
   */
  get hasVisitedWeblink() {
    if (this._hasVisitedWeblink) {
      return this._hasVisitedWeblink;
    }
    return Object.values(this.externalRepoMap).every((val) => val === true);
  }

  set hasVisitedWeblink(value) {
    this._hasVisitedWeblink = value;
  }

  /**
   * Get enough information about 'web-link' repositories to display to a user.
   */
  async externalSubmissionsMetadata() {
    let result = [];

    const repos = await this.model.sub.repositories;
    repos
      .filter((repo) => repo._isWebLink)
      .forEach((repo) => {
        result.push({
          message: `Deposit into ${repo.name} was prompted`,
          name: repo.name,
          url: repo.url,
        });
      });

    return result;
  }

  get weblinkRepos() {
    const setRepoMap = () => {
      this.md = this.externalSubmissionsMetadata;
      this.md.forEach((repo) => {
        this.externalRepoMap[repo.name] = false;
      });
    };

    if (Array.isArray(this.md) && this.md.length > 0) {
      scheduleOnce('afterRender', this, setRepoMap);
      return this.md;
    }

    return [];
  }

  get mustVisitWeblink() {
    const weblinkExists = this.weblinkRepos.length > 0;
    const isSubmitter = get(this, 'currentUser.user.id') === get(this, 'model.sub.submitter.id');
    const isProxySubmission = get(this, 'model.sub.isProxySubmission');
    const isSubmitted = this.submitted;

    return weblinkExists && isSubmitter && isProxySubmission && !isSubmitted;
  }

  get disableSubmit() {
    const needsToVisitWeblink = this.mustVisitWeblink && !this.hasVisitedWeblink;

    return needsToVisitWeblink;
  }

  /**
   * Awkward object for use in the UI composing Repository objects with related
   * Deposit and RepositoryCopy objects.
   *
   * Explicitly exclude 'web-link' repositories.
   */
  get repoMap() {
    let hasStuff = false;
    const repos = get(this, 'model.repos');
    const deps = get(this, 'model.deposits');
    const repoCopies = get(this, 'model.repoCopies');
    if (!repos) {
      return null;
    }
    let map = {};
    repos
      .filter((repo) => !repo._isWebLink)
      .forEach((r) => {
        map[r.id] = {
          repo: r,
        };
      });

    if (deps) {
      deps.forEach((deposit) => {
        hasStuff = true;
        const repo = get(deposit, 'repository');
        const repoId = get(repo, 'id');
        if (!map.hasOwnProperty(repoId)) {
          map[repoId] = {
            repo,
            deposit,
          };
        } else {
          map[repoId] = Object.assign(map[repoId], {
            deposit,
            repositoryCopy: get(deposit, 'repositoryCopy'),
          });
        }
      });
    }
    if (repoCopies) {
      hasStuff = true;
      repoCopies.forEach((rc) => {
        const repo = rc.get('repository');
        const repoId = get(repo, 'id');
        if (!map.hasOwnProperty(repoId)) {
          map[repoId] = {
            repo,
            repositoryCopy: rc,
          };
        } else {
          map[repoId] = Object.assign(map[repoId], {
            repositoryCopy: rc,
          });
        }
      });
    }
    if (hasStuff) {
      let results = [];
      Object.keys(map).forEach((k) => results.push(map[k]));
      return results;
    }

    return null;
  }

  get isSubmitter() {
    return get(this, 'model.sub.submitter.id') === get(this, 'currentUser.user.id');
  }

  get isPreparer() {
    return get(this, 'model.sub.preparers')
      .map((x) => x.id)
      .includes(get(this, 'currentUser.user.id'));
  }

  get submissionNeedsPreparer() {
    return get(this, 'model.sub.submissionStatus') === 'changes-requested';
  }

  get submissionNeedsSubmitter() {
    return (
      get(this, 'model.sub.submissionStatus') === 'approval-requested' ||
      get(this, 'model.sub.submissionStatus') === 'approval-requested-newuser'
    );
  }

  @action
  async openWeblinkAlert(repo) {
    let value = await swal.fire({
      target: ENV.APP.rootElement,
      title: 'Notice!',
      text: 'You are being sent to an external site. This will open a new tab.',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Open new tab',
    });

    if (value.dismiss) {
      // Don't redirect
      return;
    }
    // Go to the weblink repo
    this.externalRepoMap[repo.name] = true;
    const allLinksVisited = Object.values(this.externalRepoMap).every((val) => val === true);
    if (allLinksVisited) {
      this.hasVisitedWeblink = true;
    }
    $('#externalSubmission').modal('hide');

    var win = window.open(repo.url, '_blank');
    win.focus();
  }

  @action
  async requestMoreChanges() {
    let sub = get(this, 'model.sub');
    let message = this.message;

    if (!message) {
      swal.fire('Comment field empty', 'Please add a comment before requesting changes.', 'warning');
    } else {
      $('.block-user-input').css('display', 'block');
      await this.submissionHandler.requestSubmissionChanges(sub, message);
      window.location.reload(true);
    }
  }

  @action
  async approveChanges() {
    let baseURL = window.location.href.replace(new RegExp(`${ENV.rootURL}.*`), '');
    // First, check if user has visited all required weblinks.
    if (this.disableSubmit) {
      if (!this.hasVisitedWeblink) {
        $('.fa-exclamation-triangle').css('color', '#DC3545');
        $('.fa-exclamation-triangle').css('font-size', '2.2em');
        later(() => {
          $('.fa-exclamation-triangle').css('color', '#b0b0b0');
          $('.fa-exclamation-triangle').css('font-size', '2em');
        }, 4000);
        this.flashMessages.warning(
          'Please visit the listed web portal(s) to submit your manuscript directly. Metadata displayed on this page can be used to help in the submission process.',
        );
      }
      return;
    }

    // Validate manuscript files
    let manuscriptFiles = this.submissionFiles
      .filter((file) => file && file.get('fileRole') === 'manuscript')
      .filter((file) => file.submission.id === this.model.sub.id);

    manuscriptFiles = _.uniqBy(manuscriptFiles, 'id');

    if (manuscriptFiles.length === 0) {
      swal.fire(
        'Manuscript is missing',
        'At least one manuscript file is required.  Please Edit the submission to add one',
        'warning',
      );
      return;
    } else if (manuscriptFiles.length > 1) {
      swal.fire(
        'Incorrect manuscript count',
        `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please edit the file list`,
        'warning',
      );
      return;
    }

    const repositories = get(this, 'model.repos');
    if (repositories.length === 0) {
      // no repositories associated with the submission
      let result = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: 'No repositories are associated with this submission. \n You can either (a) cancel the submission or (b) return to the submission and edit it to include a repository.',
        confirmButtonText: 'Cancel submission',
        showCancelButton: true,
        cancelButtonText: 'Go back to edit information',
      });

      if (result.value) {
        this.cancelSubmission();
      }
      return;
    }

    let reposWithAgreementText = repositories
      .filter((repo) => !get(repo, '_isWebLink') && get(repo, 'agreementText'))
      .map((repo) => ({
        id: get(repo, 'name'),
        title: `Deposit requirements for ${get(repo, 'name')}`,
        html: `<textarea rows="16" cols="40" name="embargo" class="alpaca-control form-control disabled" disabled="" autocomplete="off">${get(
          repo,
          'agreementText',
        )}</textarea>`,
      }));

    let reposWithoutAgreementText = repositories
      .filter((repo) => !get(repo, '_isWebLink') && !get(repo, 'agreementText'))
      .map((repo) => ({
        id: get(repo, 'name'),
      }));

    let reposWithWebLink = repositories
      .filter((repo) => get(repo, '_isWebLink'))
      .map((repo) => ({
        id: get(repo, 'name'),
      }));
    const reposProgressSteps = reposWithAgreementText.map((repo, index) => index);
    const Queue = swal.mixin({
      target: ENV.APP.rootElement,
      input: 'checkbox',
      inputPlaceholder: "I agree to the above statement on today's date ",
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: reposProgressSteps.map((index) => '' + (index + 1)),
    });
    const result = { value: [] };
    for (const repoStep of reposProgressSteps) {
      const repoState = reposWithAgreementText[repoStep];
      const repoResult = await Queue.fire({
        currentProgressStep: repoStep,
        title: repoState.title,
        html: repoState.html,
      });
      result.value.push(repoResult.value);
    }
    const validResults = result.value.some((agree) => agree !== undefined);
    if (!validResults && reposWithAgreementText.length > 0) {
      return;
    }
    let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((repo, index) => {
      if (result.value[index] === 1) {
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

      let resultConfirm = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Confirm submission',
        html: swalMsg, // eslint-disable-line
        confirmButtonText: 'Confirm',
        showCancelButton: true,
      });

      if (resultConfirm.value) {
        // Update repos to reflect repos that user agreed to deposit.
        // Must keep web-link repos.
        this.set(
          'model.sub.repositories',
          get(this, 'model.sub.repositories').filter((repo) => {
            if (get(repo, '_isWebLink')) {
              return true;
            }
            let temp = reposWithAgreementText.map((x) => x.id).includes(get(repo, 'name'));
            if (!temp) {
              return true;
            } else if (reposThatUserAgreedToDeposit.map((r) => r.id).includes(get(repo, 'name'))) {
              return true;
            }
            return false;
          }),
        );

        let sub = get(this, 'model.sub');
        let message = this.message;
        this.submissionHandler.approveSubmission(sub, message);
      }
    } else {
      // there were repositories, but the user didn't sign any of the agreements
      let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo) => {
        if (!reposThatUserAgreedToDeposit.includes(repo)) {
          return true;
        }
      });
      let result = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(
          reposUserDidNotAgreeToDeposit.map((repo) => repo.id),
        ).replace(
          /[\[\]']/g,
          '',
        )}. Therefore, this submission cannot be submitted. \n You can either (a) cancel the submission or (b) return to the submission to provide required input and try again.`,
        confirmButtonText: 'Cancel submission',
        showCancelButton: true,
        cancelButtonText: 'Go back to edit information',
      });

      if (result.value) {
        this.cancelSubmission();
      }
    }
  }

  @action
  async cancelSubmission() {
    let message = this.message;
    let sub = get(this, 'model.sub');

    if (!message) {
      swal.fire('Comment field empty', 'Please add a comment for your cancellation.', 'warning');
      return;
    }

    let result = await swal.fire({
      target: ENV.APP.rootElement,
      title: 'Are you sure?',
      text: 'If you cancel this submission, it will not be able to be resumed.',
      confirmButtonText: 'Yes, cancel this submission',
      confirmButtonColor: '#DC3545',
      cancelButtonText: 'Never mind',
      showCancelButton: true,
    });

    if (result.value) {
      $('.block-user-input').css('display', 'block');
      await this.submissionHandler.cancelSubmission(sub, message);
      window.location.reload(true);
    }
  }

  @action
  async deleteSubmission(submission) {
    let result = await swal.fire({
      target: ENV.APP.rootElement,
      text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
      confirmButtonText: 'Delete',
      confirmButtonColor: '#DC3545',
      showCancelButton: true,
    });
    if (result.value) {
      const ignoreList = this.searchHelper;

      try {
        await this.submissionHandler.deleteSubmission(submission);

        ignoreList.clearIgnore();
        ignoreList.ignore(submission.get('id'));
        this.router.transitionTo('submissions');
      } catch (e) {
        this.flashMessages.danger(
          'We encountered an error deleting this draft submission. Please try again later or contact your administrator',
        );
      }
    }
  }
}
