import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task, timeout, dropTask } from 'ember-concurrency';
import type { Task } from 'ember-concurrency';
import { scheduleOnce } from '@ember/runloop';
import { fn, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { Textarea } from '@ember/component';
import { LinkTo } from '@ember/routing';
import ENV from 'pass-ui/config/environment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import swal from 'sweetalert2/dist/sweetalert2.js';
import { modifier } from 'ember-modifier';
import FindJournal from 'pass-ui/components/find-journal';
import WorkflowBasicsUserSearch from 'pass-ui/components/workflow-basics-user-search';

import type Workflow from 'pass-ui/services/workflow';
import type CurrentUserService from 'pass-ui/services/current-user';
import type DoiService from 'pass-ui/services/doi';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type JournalModel from 'pass-ui/models/journal';
import type GrantModel from 'pass-ui/models/grant';
import type UserModel from 'pass-ui/models/user';
import type AppStore from 'pass-ui/services/store';
import type Owner from '@ember/owner';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

const or = (...args: unknown[]) => args.some(Boolean);
const not = (a: unknown) => !a;
const and = (...args: unknown[]) => args.every(Boolean);

const perform =
  (task: Task<unknown, unknown[]>, ...curried: unknown[]) =>
  (...args: unknown[]) =>
    task.perform(...curried, ...args);

const DEBOUNCE_MS = 250;

interface WorkflowBasicsSignature {
  Args: {
    submission: SubmissionModel;
    publication: PublicationModel;
    preLoadedGrant: GrantModel | null;
    journal: JournalModel | null;
    flaggedFields: string[];
    validateTitle: () => void;
    validateJournal: () => void;
    validateSubmitterEmail: () => void;
    updatePublication: (publication: PublicationModel) => void;
    validateAndLoadTab: (gotoRoute: string) => Promise<void>;
    abort: () => void;
  };
  Blocks: {
    default: [];
  };
}

export default class WorkflowBasics extends Component<WorkflowBasicsSignature> {
  @service declare store: AppStore;
  @service declare workflow: Workflow;
  @service declare currentUser: CurrentUserService;
  @service('doi')
  declare doiService: DoiService;
  @service('metadata-schema')
  declare schemaService: MetadataSchemaService;
  @service declare appStaticConfig: AppStaticConfigService;
  @service declare flashMessages: FlashMessageService;

  @tracked contactUrl: string | null = null;
  @tracked doiServiceError: unknown = false;
  @tracked isShowingUserSearchModal = false;
  @tracked userSearchTerm = '';

  showModal = modifier((el: HTMLDialogElement) => {
    el.showModal();
  });

  get publication(): PublicationModel {
    return this.args.publication;
  }

  get submission(): SubmissionModel {
    return this.args.submission;
  }

  get preLoadedGrant(): GrantModel | null {
    return this.args.preLoadedGrant;
  }

  get journal(): JournalModel | null {
    return this.args.journal;
  }

  get flaggedFields(): string[] {
    return this.args.flaggedFields;
  }

  get isProxySubmission(): boolean {
    return this.submission?.isProxySubmission;
  }

  get inputSubmitterEmail(): string {
    return this.submission?.submitterEmailDisplay;
  }

  set inputSubmitterEmail(value: string) {
    this.submission.submitterEmail = `mailto:${value}`;
  }

  shouldSetPublication(): boolean {
    const publication = this.publication;
    return (
      !publication ||
      !publication.doi ||
      !publication.title ||
      !publication.journal ||
      !publication.journal?.journalName
    );
  }

  constructor(owner: Owner, args: WorkflowBasicsSignature['Args']) {
    super(owner, args);

    this.setupConfig();
    this.setupDoiJournal();
    this.setupSubmission();
  }

  async setupConfig() {
    this.contactUrl = this.appStaticConfig?.config?.branding?.pages?.['contactUrl'] ?? null;
  }

  setPreparers() {
    this.submission.preparers = [];
  }

  loadNext = task({ drop: true }, async () => {
    await timeout(100);
    await this.args.validateAndLoadTab('submissions.new.grants');
  });

  @action
  setupSubmission() {
    if (!this.isProxySubmission) {
      this.submission.submitter = this.currentUser.user!;
    }
  }

  @action
  setupDoiJournal() {
    const shouldSet = this.shouldSetPublication();
    this.lookupDoiAndJournal(shouldSet);
  }

  lookupDoiAndJournal(setPublication: boolean) {
    this.lookupDOI.perform(setPublication);
    if (!this.publication?.doi && this.journal) {
      // @ts-expect-error - Ember scheduleOnce with string method name
      scheduleOnce('afterRender', this, 'selectJournal', this.journal);
    }
  }

  get isValidDOI(): boolean {
    return !this.doiServiceError && this.doiService.isValidDOI(this.publication?.doi);
  }

  get titleClass(): string {
    return this.flaggedFields.indexOf('title') > -1 ? 'form-control is-invalid' : 'form-control';
  }

  get journalClass(): string {
    return this.flaggedFields.indexOf('journal') > -1 ? 'is-invalid' : 'is-valid';
  }

  get submitterEmailClass(): string {
    return this.flaggedFields.indexOf('submitterEmail') > -1 ? 'is-invalid' : '';
  }

  get doiClass(): string {
    const doi = this.publication?.doi;
    if (doi == null || !doi) {
      return 'form-control';
    } else if (this.isValidDOI === true) {
      return 'form-control is-valid';
    }
    return 'form-control is-invalid';
  }

  clearDoiData(doi?: string) {
    const workflow = this.workflow;

    if (workflow.isDataFromCrossref()) {
      workflow.setFromCrossref(false);
      workflow.setReadOnlyProperties([]);
      this.submission.metadata = '{}';
      this.clearPublication(doi);
    }
  }

  clearPublication(doi?: string) {
    const pub = this.publication;
    pub.doi = doi ?? '';
    pub.title = '';
    pub.abstract = '';
    pub.volume = '';
    pub.issue = '';
    pub.pmid = '';
    pub.journal = null;
  }

  updateMetadata(metadata: Record<string, unknown>) {
    this.workflow.setReadOnlyProperties(Object.keys(metadata));
    metadata = Object.assign(this.submission.metadata ? JSON.parse(this.submission.metadata) : {}, metadata);
    this.submission.metadata = JSON.stringify(metadata);
  }

  @action
  proxyStatusToggled(isProxySubmission: boolean) {
    if ((this.isProxySubmission && !isProxySubmission) || (!this.isProxySubmission && isProxySubmission)) {
      this.changeSubmitter(isProxySubmission, null);
    }
  }

  @action
  toggleUserSearchModal() {
    this.isShowingUserSearchModal = !this.isShowingUserSearchModal;
  }

  @action
  handleProxySearchEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.toggleUserSearchModal();
    }
  }

  @action
  pickSubmitter(submitter: UserModel) {
    this.changeSubmitter(true, submitter);
    this.toggleUserSearchModal();
    this.userSearchTerm = '';
    this.args.validateSubmitterEmail();
  }

  @action
  async changeSubmitter(isProxySubmission: boolean, submitter: UserModel | null) {
    const grants = this.submission?.grants;
    const hasGrants = grants && grants.length > 0;
    if (hasGrants) {
      const result = swal.fire({
        target: ENV.APP.rootElement,
        icon: 'warning',
        title: 'Are you sure?',
        html: 'Changing the submitter will also <strong>remove any grants</strong> currently attached to your submission. Are you sure you want to proceed?',
        showCancelButton: true,
        cancelButtonText: 'Never mind',
        confirmButtonText: "Yes, I'm sure",
      });

      // @ts-expect-error - swal.fire returns Promise but code accesses .value synchronously (legacy bug)
      if (result.value) {
        this.submission.grants = [];
        this.updateSubmitterModel(isProxySubmission, submitter);

        this.flashMessages.info('Submitter and related grants removed from submission.');
      }
    } else {
      this.updateSubmitterModel(isProxySubmission, submitter);
    }
  }

  @action
  updateSubmitterModel(isProxySubmission: boolean, submitter: UserModel | null) {
    this.workflow.setMaxStep(1);
    // @ts-expect-error - Ember Data allows null for string attrs
    this.submission.submitterEmail = null;
    this.submission.submitterName = '';
    if (isProxySubmission) {
      this.submission.submitter = submitter!;
      this.submission.preparers = [this.currentUser.user!];
    } else {
      this.submission.submitter = this.currentUser.user!;
      this.submission.preparers = [];
    }
  }

  @action
  selectJournal(journal: JournalModel) {
    const metadata = this.doiService.doiToMetadata({}, journal, this.schemaService.getAllFields());
    metadata['journal-title'] = journal.journalName;
    metadata['title'] = this.publication.title;
    this.updateMetadata(metadata);

    this.publication.journal = journal;
    this.args.validateJournal();
  }

  @action
  cancel() {
    this.args.abort();
  }

  @action
  handleDoiInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.publication.doi = value;
    this.lookupDOI.perform(true);
  }

  @action
  handleSearchInput(event: Event) {
    this.userSearchTerm = (event.target as HTMLInputElement).value;
  }

  @action
  handleEmailInput(event: Event) {
    this.inputSubmitterEmail = (event.target as HTMLInputElement).value;
  }

  @action
  handleNameInput(event: Event) {
    this.submission.submitterName = (event.target as HTMLInputElement).value;
  }

  @action
  handleTitleInput(event: Event) {
    this.publication.title = (event.target as HTMLTextAreaElement).value;
  }

  @action
  handleRemoveSubmitter(event: Event) {
    event.preventDefault();
    this.changeSubmitter(this.isProxySubmission, null);
  }

  lookupDOI = dropTask(async (setPublication: boolean) => {
    await timeout(DEBOUNCE_MS);

    try {
      this.doiServiceError = false;

      const publication = this.publication;
      if (!publication || !publication.doi) {
        this.clearDoiData();
        return;
      }

      const doiService = this.doiService;
      let doi = publication.doi;

      doi = doiService.formatDOI(doi);
      if (!doi || doi === '' || doiService.isValidDOI(doi) === false) {
        this.clearDoiData(this.publication.doi);
        return;
      }

      publication.doi = doi;

      this.flashMessages.info('Please wait while we look up information about your DOI');

      const result = await doiService.resolveDOI.perform(doi);

      if (setPublication) {
        this.args.updatePublication(result.publication);
      }

      const metadata = this.doiService.doiToMetadata(
        result.doiInfo,
        result.publication.journal,
        this.schemaService.getAllFields(),
      );
      metadata['journal-title'] = result.publication.journal?.journalName;
      metadata['title'] = this.publication.title;
      this.updateMetadata(metadata);

      this.workflow.setFromCrossref(true);

      this.flashMessages.success("We've pre-populated information from the DOI provided!");
      this.args.validateTitle();
      this.args.validateJournal();
    } catch (error) {
      console.log(`DOI service request failed: ${error}`);

      this.clearDoiData(this.publication.doi);
      this.doiServiceError = error;
    }
  });

  <template>
    {{! template-lint-disable link-href-attributes no-triple-curlies require-button-type require-input-label simple-unless }}
    {{yield}}
    {{#unless (or @submission.id @preLoadedGrant)}}
      <div class='py-0 mt-2'>
        <p class='my-2 lead'>
          I'm creating this submission on behalf of:
          <label>
            <input
              type='radio'
              checked={{not this.isProxySubmission}}
              {{on 'change' (fn this.proxyStatusToggled false)}}
            />
            Myself
          </label>
          <label>
            <input
              type='radio'
              checked={{this.isProxySubmission}}
              {{on 'change' (fn this.proxyStatusToggled true)}}
              data-test-proxy-radio-button
            />
            Someone else
          </label>
        </p>
      </div>
      {{#if this.isProxySubmission}}
        <div id='proxy-input-block' class='p-4'>
          <p>
            When a submission is created on someone's behalf, PASS will contact that person to acquire their approval
            before finalizing the submission and sending it to its corresponding repositories.
          </p>
          <p class='mb-0'>
            Please indicate on behalf of whom this submission is being completed:
          </p>
          <div class='input-group pb-3'>
            <input
              type='text'
              aria-label='Proxy search input'
              {{on 'keydown' this.handleProxySearchEnter}}
              {{on 'input' this.handleSearchInput}}
              value={{this.userSearchTerm}}
              class='form-control'
              data-test-proxy-search-input
            />
            <span class='input-group-btn'>
              <button
                id='search-for-users'
                class='btn btn-primary'
                type='button'
                data-test-proxy-user-search-button
                {{on 'click' this.toggleUserSearchModal}}
              >
                Search
              </button>
            </span>
          </div>
          {{#if @submission.submitter.id}}
            <p>
              Currently selected submitter:
              <br />{{@submission.submitter.firstName}}
              {{@submission.submitter.lastName}}
              (
              <a href='mailto:{{@submission.submitter.email}}'>
                {{@submission.submitter.email}}
              </a>
              )
              <br />
              (
              <a href='#' {{on 'click' this.handleRemoveSubmitter}}>
                Remove submitter
              </a>
              )
            </p>
          {{/if}}
          <p class='mb-0'>
            <strong>
              If the person you are submitting for does not have an account with PASS
            </strong>
            , please provide their email address and name so we may notify them:
          </p>
          <div class='form-inline'>
            <input
              type='text'
              aria-label='Proxy submitter email input'
              class={{concat 'mt-1 mb-3 form-control w-50 ' this.submitterEmailClass}}
              {{on 'keyup' @validateSubmitterEmail}}
              {{on 'input' this.handleEmailInput}}
              disabled={{@submission.submitter.id}}
              value={{this.inputSubmitterEmail}}
              placeholder='Email address'
              data-test-proxy-submitter-email-input
            />
            <input
              type='text'
              aria-label='Proxy submitter name input'
              class='mt-1 mb-3 form-control w-50'
              {{on 'input' this.handleNameInput}}
              disabled={{@submission.submitter.id}}
              value={{@submission.submitterName}}
              placeholder='Name'
              data-test-proxy-submitter-name-input
            />
          </div>
        </div>
      {{/if}}
    {{/unless}}
    <p class='lead text-muted'>
      If the manuscript/article you are submitting has been assigned a Digital Object Identifier (DOI), please provide
      it now to pre-populate submission forms.
    </p>
    <div class='mb-3'>
      <label for='doi'>
        DOI
      </label>
      <p class='help-block'>
        <i class='glyphicon glyphicon-info-sign'></i>
        <i>
          A digital object identifier (DOI) is a unique alphanumeric string assigned to identify content and provide a
          persistent link to its location on the Internet. The publisher assigns a DOI some time after your manuscript
          is accepted for publication. The DOI is typically located on the first page of the electronic journal article,
          near the copyright notice. The DOI can also be found on the database landing page for the article.
        </i>
      </p>

      <input
        id='doi'
        type='text'
        class={{this.doiClass}}
        placeholder='Leave blank if your manuscript or article has not yet been assigned a DOI'
        value={{@publication.doi}}
        data-test-doi-input={{true}}
        {{on 'input' this.handleDoiInput}}
      />
      <div class='text-danger'>
        {{if (and @publication.doi (not this.isValidDOI) (not this.doiServiceError)) 'Please provide a valid DOI'}}
      </div>
      {{#if this.doiServiceError}}
        <div class='text-danger'>
          {{! @glint-expect-error - doiServiceError is unknown but rendered as HTML }}
          {{{this.doiServiceError.message}}}
        </div>
      {{/if}}
    </div>
    <div class='mb-3'>
      <label for='title'>
        Manuscript/Article Title
        <span class='text-muted'>
          (required)
        </span>
      </label>
      <Textarea
        class={{this.titleClass}}
        placeholder='Manuscript/Article Title'
        @value={{@publication.title}}
        cols='100%'
        rows='2'
        {{on 'keyup' @validateTitle}}
        {{on 'input' this.handleTitleInput}}
        id='title'
        disabled={{this.isValidDOI}}
        data-test-article-title-text-area={{true}}
      />
    </div>

    <div class='mb-3'>
      <p class='lead text-muted'>
        If you are an NIH-user, a journal selection is required to deposit into PMC. It is optional for all other users.
        If you do not see your journal listed, you can skip the journal selection and still use PASS to deposit into
        JScholarship.
      </p>
      <div>
        <label for='journal'>
          Journal
        </label>
        {{#if this.contactUrl}}
          <a class='btn btn-link pull-right pr-0' href='{{this.contactUrl}}'>
            Can't find your journal? Contact us to add it.
          </a>
        {{/if}}
      </div>
      <div class='w-100'>
        {{#unless this.isValidDOI}}
          <FindJournal
            @id='journal'
            @selectJournal={{this.selectJournal}}
            @value={{@publication.journal}}
            @journalClass={{this.journalClass}}
            @isValidDOI={{this.isValidDOI}}
            data-test-find-journal
          />
        {{else}}
          <input
            id='journal'
            type='text'
            class='form-control'
            value={{@publication.journal.journalName}}
            disabled
            data-test-journal-name-input
          />
        {{/unless}}
      </div>
    </div>
    <LinkTo @route='submissions.index' class='btn btn-outline-primary'>
      Back
    </LinkTo>
    <button class='btn btn-outline-danger ml-2' type='button' {{on 'click' this.cancel}}>
      Cancel
    </button>
    <button
      class='btn btn-primary pull-right next'
      type='button'
      data-test-workflow-basics-next
      {{on 'click' (perform this.loadNext)}}
      disabled={{this.loadNext.isRunning}}
    >
      Next
    </button>
    {{#if this.isShowingUserSearchModal}}
      <dialog
        class='ember-modal-dialog pass-modal-translucent user-search-modal'
        {{this.showModal}}
        {{on 'close' this.toggleUserSearchModal}}
      >
        <WorkflowBasicsUserSearch
          @toggleUserSearchModal={{this.toggleUserSearchModal}}
          @pickSubmitter={{this.pickSubmitter}}
          @searchInput={{this.userSearchTerm}}
        />
      </dialog>
    {{/if}}
  </template>
}
