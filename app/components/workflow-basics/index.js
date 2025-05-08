/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, no-setter-return */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { scheduleOnce } from '@ember/runloop';
import { dropTask } from 'ember-concurrency-decorators';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';

const DEBOUNCE_MS = 250;

export default class WorkflowBasics extends Component {
  @service store;
  @service workflow;
  @service currentUser;
  @service('doi') doiService;
  @service('metadata-schema') schemaService;
  @service appStaticConfig;
  @service flashMessages;

  @tracked contactUrl = null;
  @tracked doiServiceError = false;
  @tracked isShowingUserSearchModal = false;

  @alias('args.publication') publication;
  @alias('args.submission') submission;
  @alias('args.preLoadedGrant') preLoadedGrant;
  @alias('args.journal') journal;
  @alias('args.flaggedFields') flaggedFields;

  get isProxySubmission() {
    return get(this, 'args.submission.isProxySubmission');
  }

  get inputSubmitterEmail() {
    return get(this, 'submission.submitterEmailDisplay');
  }

  set inputSubmitterEmail(value) {
    this.submission.submitterEmail = `mailto:${value}`;
    return value;
  }

  /**
   * Publication should be set/overwritten if there is no current publication, if the current
   * publication has no DOI or Title, or it the current publication has no journal or no journal
   * with a journalName
   */
  shouldSetPublication() {
    const publication = this.publication;
    return (
      !publication ||
      !publication.doi ||
      !publication.title ||
      !publication.journal ||
      !get(publication, 'journal.journalName')
    );
  }

  constructor() {
    super(...arguments);

    this.setupConfig();
    this.setupDoiJournal();
    this.setupSubmission();
  }

  async setupConfig() {
    this.contactUrl = this.appStaticConfig?.config?.branding?.pages?.contactUrl;
  }

  setPreparers() {
    set(this.submission, 'preparers', []);
  }

  loadNext = task({ drop: true }, async () => {
    await timeout(100);
    await this.args.validateAndLoadTab('submissions.new.grants');
  });

  @action
  setupSubmission() {
    if (!this.isProxySubmission) {
      this.submission.submitter = this.currentUser.user;
      // set(this.submission, 'preparers', []);
    }
  }

  @action
  setupDoiJournal() {
    // TODO: commenting this out will produce orphaned publications in Fedora
    // but including it was causing non-deterministic behavior (race condition?) when restarting a submission
    // there may be a better way to achieve what was previously being done here.
    // get(this, 'workflow').setFromCrossref(false);

    const shouldSet = this.shouldSetPublication();
    this.lookupDoiAndJournal(shouldSet);
  }

  /**
   * Look up the known DOI in Crossref to get metadata, as well as the expected Publication object
   * and associated Journal.
   *
   * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
   */
  lookupDoiAndJournal(setPublication) {
    this.lookupDOI.perform(setPublication);
    /**
     * If a Journal object exists in the model, then we have loaded an existing Submission
     * with a Publication and a Journal.
     *
     * Only do this if there is no publication DOI, as the DOI lookup will cover this case.
     */
    if (!get(this, 'publication.doi') && this.journal) {
      scheduleOnce('afterRender', this, 'selectJournal', this.journal);
    }
  }

  get isValidDOI() {
    return !this.doiServiceError && this.doiService.isValidDOI(get(this, 'publication.doi'));
  }

  get titleClass() {
    return this.flaggedFields.indexOf('title') > -1 ? 'form-control is-invalid' : 'form-control';
  }

  get journalClass() {
    return this.flaggedFields.indexOf('journal') > -1 ? 'is-invalid' : 'is-valid';
  }

  get submitterEmailClass() {
    return this.flaggedFields.indexOf('submitterEmail') > -1 ? 'is-invalid' : '';
  }

  get doiClass() {
    let doi = get(this, 'publication.doi');
    if (doi == null || !doi) {
      return 'form-control';
    } else if (this.isValidDOI === true) {
      return 'form-control is-valid';
    }
    return 'form-control is-invalid';
  }

  clearDoiData(doi) {
    const workflow = this.workflow;

    if (workflow.isDataFromCrossref()) {
      workflow.setFromCrossref(false);
      workflow.setReadOnlyProperties([]);
      this.submission.metadata = '{}';
      this.clearPublication(doi);
    }
  }

  /**
   * Remove all data from the current Publication
   */
  clearPublication(doi) {
    this.publication.setProperties({
      doi,
      title: '',
      abstract: '',
      volume: '',
      issue: '',
      pmid: '',
      journal: undefined,
    });
  }

  /**
   * Update the submission metadata, giving priority to this metadata. Also mark it as read only.
   */
  updateMetadata(metadata) {
    this.workflow.setReadOnlyProperties(Object.keys(metadata));
    metadata = Object.assign(this.submission.metadata ? JSON.parse(this.submission.metadata) : {}, metadata);
    this.submission.metadata = JSON.stringify(metadata);
  }

  @action
  proxyStatusToggled(isProxySubmission) {
    // do only if the values indicate a switch of proxy
    if ((this.isProxySubmission && !isProxySubmission) || (!this.isProxySubmission && isProxySubmission)) {
      this.changeSubmitter(isProxySubmission, null);
    }
  }

  @action
  toggleUserSearchModal() {
    this.isShowingUserSearchModal = !this.isShowingUserSearchModal;
  }

  @action
  pickSubmitter(submitter) {
    this.changeSubmitter(true, submitter);
    this.toggleUserSearchModal();
    this.userSearchTerm = '';
    this.args.validateSubmitterEmail(); // remove red border if there is one
  }

  @action
  async changeSubmitter(isProxySubmission, submitter) {
    let hasGrants = get(this, 'submission.grants') && get(this, 'submission.grants.length') > 0;
    if (hasGrants) {
      let result = swal.fire({
        target: ENV.APP.rootElement,
        icon: 'warning',
        title: 'Are you sure?',
        html: 'Changing the submitter will also <strong>remove any grants</strong> currently attached to your submission. Are you sure you want to proceed?',
        showCancelButton: true,
        cancelButtonText: 'Never mind',
        confirmButtonText: "Yes, I'm sure",
      });

      if (result.value) {
        set(this, 'submission.grants', []);
        this.updateSubmitterModel(isProxySubmission, submitter);

        this.flashMessages.info('Submitter and related grants removed from submission.');
      }
    } else {
      this.updateSubmitterModel(isProxySubmission, submitter);
    }
  }

  @action
  updateSubmitterModel(isProxySubmission, submitter) {
    this.workflow.setMaxStep(1);
    this.submission.submitterEmail = null;
    this.submission.submitterName = '';
    if (isProxySubmission) {
      this.submission.submitter = submitter;
      this.submission.preparers = [this.currentUser.user];
    } else {
      this.submission.submitter = this.currentUser.user;
      this.submission.preparers = [];
    }
  }

  /** Sets the selected journal for the current publication.
   * @param journal {DS.Model} The journal
   */
  @action
  selectJournal(journal) {
    // Formats metadata and adds journal metadata
    let metadata = this.doiService.doiToMetadata({}, journal, this.schemaService.getAllFields());
    metadata['journal-title'] = journal.journalName;
    metadata.title = this.publication.title;
    this.updateMetadata(metadata);

    this.publication.journal = journal;
    this.args.validateJournal();
  }

  @action
  cancel() {
    this.args.abort();
  }

  /**
   * lookupDOI - Set publication, publication journal, and doiInfo based on DOI.
   *
   * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
   */
  @dropTask
  lookupDOI = function* (setPublication) {
    yield timeout(DEBOUNCE_MS);

    try {
      this.doiServiceError = false;

      const publication = this.publication;
      if (!publication || !get(publication, 'doi')) {
        // Note that any metadata now does NOT come from Xref
        this.clearDoiData();
        return;
      }

      const doiService = this.doiService;
      let doi = get(publication, 'doi');

      doi = doiService.formatDOI(doi);
      if (!doi || doi === '' || doiService.isValidDOI(doi) === false) {
        this.clearDoiData(this.publication.doi); // Clear out title/Journal if user enters a valid DOI, then changes it to an invalid DOI
        return;
      }

      set(publication, 'doi', doi);

      this.flashMessages.info('Please wait while we look up information about your DOI');

      const result = yield doiService.resolveDOI.perform(doi);

      if (setPublication) {
        this.args.updatePublication(result.publication);
      }

      let metadata = this.doiService.doiToMetadata(
        result.doiInfo,
        result.publication.journal,
        this.schemaService.getAllFields(),
      );
      metadata['journal-title'] = result.publication.journal.get('journalName');
      metadata.title = this.publication.title;
      this.updateMetadata(metadata);

      this.workflow.setFromCrossref(true);

      this.flashMessages.success("We've pre-populated information from the DOI provided!");
      this.args.validateTitle();
      this.args.validateJournal();
    } catch (error) {
      console.log(`DOI service request failed: ${error}`);

      this.clearDoiData(this.publication.doi);
      set(this, 'doiServiceError', error);
      // eslint-disable-next-line newline-per-chained-call
    }
  };
}
