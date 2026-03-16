/* eslint-disable ember/no-side-effects */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ENV from 'pass-ui/config/environment';
import { service } from '@ember/service';
import { later, scheduleOnce } from '@ember/runloop';
import swal from 'sweetalert2/dist/sweetalert2.js';
import type RouterService from '@ember/routing/router-service';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type SearchHelperService from 'pass-ui/services/search-helper';
import type SubmissionModel from 'pass-ui/models/submission';
import type RepositoryModel from 'pass-ui/models/repository';
import type DepositModel from 'pass-ui/models/deposit';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';
import type UserModel from 'pass-ui/models/user';
import type FileModel from 'pass-ui/models/file';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type Owner from '@ember/owner';
import type AppStore from 'pass-ui/services/store';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

interface ExternalRepoMetadata {
  message: string;
  name: string;
  url: string;
}

interface RepoMapEntry {
  repo: RepositoryModel;
  deposit?: DepositModel;
  repositoryCopy?: RepositoryCopyModel;
}

interface DetailModel {
  sub: SubmissionModel;
  deposits: DepositModel[];
  repoCopies: RepositoryCopyModel[];
  repos: RepositoryModel[];
  files: FileModel[];
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsDetail extends Controller {
  declare model: DetailModel;

  @service declare currentUser: CurrentUserService;
  @service declare store: AppStore;
  @service declare submissionHandler: SubmissionHandlerService;
  @service declare searchHelper: SearchHelperService;
  @service declare flashMessages: FlashMessageService;
  @service declare router: RouterService;

  md: ExternalRepoMetadata[] | undefined;
  message: string | undefined;

  constructor(owner: Owner) {
    super(owner);

    const element = document.querySelector('[data-toggle="tooltip"]') as HTMLElement | null;
    if (element) (element as HTMLElement & { tooltip(): void }).tooltip();
  }

  // @ts-expect-error TS2729 - model available via Ember controller prototype
  @tracked submitted: boolean = this.model?.sub?.submitted ?? false;
  // @ts-expect-error TS2729 - model available via Ember controller prototype
  @tracked repositories: RepositoryModel[] = this.model?.sub?.repositories ?? [];
  @tracked externalRepoMap: Record<string, boolean> = {};
  @tracked _hasVisitedWeblink: boolean | null = null;

  get submissionFiles(): FileModel[] {
    return this.model.files;
  }

  get displaySubmitterName(): string {
    const submitter = this.model.sub.submitter;
    if (submitter?.displayName) {
      return submitter.displayName;
    } else if (submitter?.firstName) {
      return `${submitter.firstName} ${submitter.lastName}`;
    } else if (this.model.sub.submitterName) {
      return this.model.sub.submitterName;
    }

    return '';
  }

  get displaySubmitterEmail(): string {
    const submitter = this.model.sub.submitter;
    if (submitter?.email) {
      return submitter.email;
    } else if (this.model.sub.submitterEmail) {
      return this.model.sub.submitterEmailDisplay;
    }

    return '';
  }

  get externalSubmission(): ExternalRepoMetadata[] {
    let result: ExternalRepoMetadata[] = [];

    const processExternalSubmissionsMetadata = () => {
      result = this.externalSubmissionsMetadata as unknown as ExternalRepoMetadata[];
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
  get hasVisitedWeblink(): boolean | null {
    if (this._hasVisitedWeblink) {
      return this._hasVisitedWeblink;
    }
    return Object.values(this.externalRepoMap).every((val) => val === true);
  }

  set hasVisitedWeblink(value: boolean | null) {
    this._hasVisitedWeblink = value;
  }

  /**
   * Get enough information about 'web-link' repositories to display to a user.
   */
  externalSubmissionsMetadata(): ExternalRepoMetadata[] {
    const result: ExternalRepoMetadata[] = [];

    const repos = this.model.sub.repositories;
    repos
      .filter((repo: RepositoryModel) => repo._isWebLink)
      .forEach((repo: RepositoryModel) => {
        result.push({
          message: `Deposit into ${repo.name} was prompted`,
          name: repo.name,
          url: repo.url,
        });
      });

    return result;
  }

  get weblinkRepos(): ExternalRepoMetadata[] {
    const setRepoMap = () => {
      this.md = this.externalSubmissionsMetadata as unknown as ExternalRepoMetadata[];
      this.md.forEach((repo: ExternalRepoMetadata) => {
        this.externalRepoMap[repo.name] = false;
      });
    };

    if (Array.isArray(this.md) && this.md.length > 0) {
      scheduleOnce('afterRender', this, setRepoMap);
      return this.md;
    }

    return [];
  }

  get mustVisitWeblink(): boolean {
    const weblinkExists = this.weblinkRepos.length > 0;
    const isSubmitter = this.currentUser.user?.id === this.model.sub.submitter?.id;
    const isProxySubmission = this.model.sub.isProxySubmission;
    const isSubmitted = this.submitted;

    return weblinkExists && isSubmitter && isProxySubmission && !isSubmitted;
  }

  get disableSubmit(): boolean {
    const needsToVisitWeblink = this.mustVisitWeblink && !this.hasVisitedWeblink;

    return needsToVisitWeblink;
  }

  /**
   * Awkward object for use in the UI composing Repository objects with related
   * Deposit and RepositoryCopy objects.
   *
   * Explicitly exclude 'web-link' repositories.
   */
  get repoMap(): RepoMapEntry[] | null {
    let hasStuff = false;
    const repos = this.model.repos;
    const deps = this.model.deposits;
    const repoCopies = this.model.repoCopies;
    if (!repos) {
      return null;
    }
    const map: Record<string, RepoMapEntry> = {};
    repos
      .filter((repo: RepositoryModel) => !repo._isWebLink)
      .forEach((r: RepositoryModel) => {
        map[r.id!] = {
          repo: r,
        };
      });

    if (deps) {
      deps.forEach((deposit: DepositModel) => {
        hasStuff = true;
        const repo = deposit.repository;
        const repoId = repo.id as string;
        if (!map.hasOwnProperty(repoId)) {
          map[repoId] = {
            repo,
            deposit,
          };
        } else {
          map[repoId] = Object.assign(map[repoId]!, {
            deposit,
            repositoryCopy: deposit.repositoryCopy,
          });
        }
      });
    }
    if (repoCopies) {
      hasStuff = true;
      repoCopies.forEach((rc: RepositoryCopyModel) => {
        const repo = rc.repository;
        const repoId = repo.id as string;
        if (!map.hasOwnProperty(repoId)) {
          map[repoId] = {
            repo,
            repositoryCopy: rc,
          };
        } else {
          map[repoId] = Object.assign(map[repoId]!, {
            repositoryCopy: rc,
          });
        }
      });
    }
    if (hasStuff) {
      const results: RepoMapEntry[] = [];
      Object.keys(map).forEach((k: string) => results.push(map[k]!));
      return results;
    }

    return null;
  }

  get isSubmitter(): boolean {
    return this.model.sub.submitter?.id === this.currentUser.user?.id;
  }

  get isPreparer(): boolean {
    return (this.model.sub.preparers as UserModel[])
      .map((x: UserModel) => x.id)
      .includes(this.currentUser.user?.id ?? null);
  }

  get submissionNeedsPreparer(): boolean {
    return this.model.sub.submissionStatus === 'changes-requested';
  }

  get submissionNeedsSubmitter(): boolean {
    return (
      this.model.sub.submissionStatus === 'approval-requested' ||
      this.model.sub.submissionStatus === 'approval-requested-newuser'
    );
  }

  @action
  async openWeblinkAlert(repo: ExternalRepoMetadata): Promise<void> {
    const value = await swal.fire({
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
    const allLinksVisited = Object.values(this.externalRepoMap).every((val: boolean) => val === true);
    if (allLinksVisited) {
      this.hasVisitedWeblink = true;
    }

    swal.close();

    const win = window.open(repo.url, '_blank');
    win!.focus();
  }

  @action
  async requestMoreChanges(): Promise<void> {
    const sub = this.model.sub;
    const message = this.message;

    if (!message) {
      swal.fire('Comment field empty', 'Please add a comment before requesting changes.', 'warning');
    } else {
      document.querySelectorAll<HTMLElement>('.block-user-input').forEach((el: HTMLElement) => {
        el.style.display = 'block';
      });

      await this.submissionHandler.requestSubmissionChanges(sub, message);
      window.location.reload();
    }
  }

  private _warnWeblinkNotVisited(): void {
    this.submissionHandler.setLinkVisited(false);

    later(() => {
      this.submissionHandler.setLinkVisited(true);
    }, 4000);
    this.flashMessages.warning(
      'Please visit the listed web portal(s) to submit your manuscript directly. Metadata displayed on this page can be used to help in the submission process.',
    );
  }

  private _validateManuscriptFiles(): FileModel[] | null {
    let manuscriptFiles = this.submissionFiles
      .filter((file: FileModel) => file?.fileRole === 'manuscript')
      .filter((file: FileModel) => file.submission.id === this.model.sub.id);

    manuscriptFiles = [...new Map(manuscriptFiles.map((file: FileModel) => [file.id, file])).values()];

    if (manuscriptFiles.length === 0) {
      swal.fire(
        'Manuscript is missing',
        'At least one manuscript file is required.  Please Edit the submission to add one',
        'warning',
      );
      return null;
    } else if (manuscriptFiles.length > 1) {
      swal.fire(
        'Incorrect manuscript count',
        `Only one file may be designated as the manuscript.  Instead, found ${manuscriptFiles.length}.  Please edit the file list`,
        'warning',
      );
      return null;
    }

    return manuscriptFiles;
  }

  private _categorizeRepositories(repositories: RepositoryModel[]) {
    const withAgreement = repositories
      .filter((repo: RepositoryModel) => !repo._isWebLink && repo.agreementText)
      .map((repo: RepositoryModel) => ({
        id: repo.name,
        title: `Deposit requirements for ${repo.name}`,
        html: `<textarea rows="16" cols="40" name="embargo" class="form-control disabled" disabled="" autocomplete="off">${repo.agreementText}</textarea>`,
      }));

    const withoutAgreement = repositories
      .filter((repo: RepositoryModel) => !repo._isWebLink && !repo.agreementText)
      .map((repo: RepositoryModel) => ({ id: repo.name }));

    const withWebLink = repositories
      .filter((repo: RepositoryModel) => repo._isWebLink)
      .map((repo: RepositoryModel) => ({ id: repo.name }));

    return { withAgreement, withoutAgreement, withWebLink };
  }

  private async _collectAgreements(
    reposWithAgreement: { id: string; title: string; html: string }[],
  ): Promise<{ agreed: { id: string }[]; cancelled: boolean }> {
    const steps = reposWithAgreement.map((_repo, index: number) => index);
    const Queue = swal.mixin({
      target: ENV.APP.rootElement,
      input: 'checkbox',
      inputPlaceholder: "I agree to the above statement on today's date ",
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: steps.map((index) => '' + (index + 1)),
    });

    const values: (number | undefined)[] = [];
    for (const step of steps) {
      const repoState = reposWithAgreement[step]!;
      const repoResult = await Queue.fire({
        currentProgressStep: step,
        title: repoState.title,
        html: repoState.html,
      });
      values.push(repoResult.value);
    }

    const cancelled = !values.some((v) => v !== undefined) && reposWithAgreement.length > 0;
    const agreed = reposWithAgreement.filter((_repo, i) => values[i] === 1);
    return { agreed, cancelled };
  }

  private _buildConfirmationMessage(
    agreed: { id: string }[],
    withoutAgreement: { id: string }[],
    withWebLink: { id: string }[],
  ): string {
    let msg = 'Once you click confirm you will no longer be able to edit this submission or add repositories.<br/>';
    if (withoutAgreement.length > 0 || agreed.length > 0) {
      const names = [...agreed, ...withoutAgreement].map((r) => r.id);
      msg += `You are about to submit your files to: <pre><code>${JSON.stringify(names).replace(/[[\]']/g, '')} </code></pre>`;
    }
    if (withWebLink.length > 0) {
      msg += `You were prompted to submit to: <code><pre>${JSON.stringify(withWebLink.map((r) => r.id)).replace(/[[\]']/g, '')}</code></pre>`;
    }
    return msg;
  }

  @action
  async approveChanges(): Promise<void> {
    if (this.disableSubmit) {
      if (!this.hasVisitedWeblink) {
        this._warnWeblinkNotVisited();
      }
      return;
    }

    if (!this._validateManuscriptFiles()) {
      return;
    }

    const repositories = this.model.repos;
    if (repositories.length === 0) {
      const result = await swal.fire({
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

    const { withAgreement, withoutAgreement, withWebLink } = this._categorizeRepositories(repositories);
    const { agreed, cancelled } = await this._collectAgreements(withAgreement);

    if (cancelled) {
      return;
    }

    if (withoutAgreement.length > 0 || agreed.length > 0 || withWebLink.length > 0) {
      const swalMsg = this._buildConfirmationMessage(agreed, withoutAgreement, withWebLink);
      const resultConfirm = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Confirm submission',
        html: swalMsg,
        confirmButtonText: 'Confirm',
        showCancelButton: true,
      });

      if (resultConfirm.value) {
        const agreedIds = agreed.map((r) => r.id);
        const agreementIds = withAgreement.map((r) => r.id);
        this.model.sub.repositories = (this.model.sub.repositories as RepositoryModel[]).filter(
          (repo: RepositoryModel) =>
            repo._isWebLink || !agreementIds.includes(repo.name) || agreedIds.includes(repo.name),
        );
        this.submissionHandler.approveSubmission(this.model.sub, this.message!);
      }
    } else {
      const declined = withAgreement.filter((r) => !agreed.includes(r));
      const result = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(declined.map((r) => r.id)).replace(/[[\]']/g, '')}. Therefore, this submission cannot be submitted. \n You can either (a) cancel the submission or (b) return to the submission to provide required input and try again.`,
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
    const message = this.message;
    const sub = this.model.sub;

    if (!message) {
      swal.fire('Comment field empty', 'Please add a comment for your cancellation.', 'warning');
      return;
    }

    const result = await swal.fire({
      target: ENV.APP.rootElement,
      title: 'Are you sure?',
      text: 'If you cancel this submission, it will not be able to be resumed.',
      confirmButtonText: 'Yes, cancel this submission',
      confirmButtonColor: '#DC3545',
      cancelButtonText: 'Never mind',
      showCancelButton: true,
    });

    if (result.value) {
      document.querySelectorAll<HTMLElement>('.block-user-input').forEach((el: HTMLElement) => {
        el.style.display = 'block';
      });

      await this.submissionHandler.cancelSubmission(sub, message);
      window.location.reload();
    }
  }

  @action
  async deleteSubmission(submission: SubmissionModel) {
    const result = await swal.fire({
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
        ignoreList.ignore(submission.id!);
        this.router.transitionTo('submissions');
      } catch (e) {
        this.flashMessages.danger(
          'We encountered an error deleting this draft submission. Please try again later or contact your administrator',
        );
      }
    }
  }
}
