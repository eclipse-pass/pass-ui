import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 250;

export default class WorkflowBasics extends Component {
  @service store;
  @service workflow;
  @service currentUser;
  @service('doi') doiService;
  @service metadataSchema;
  @service appStaticConfig;

  @tracked contactUrl = null;
  @tracked doiServiceError = false;
  @tracked isShowingUserSearchModal = false;

  @alias('args.publication') publication;
  @alias('args.submission') submission;
  @alias('args.preLoadedGrant') preLoadedGrant;
  @alias('args.doiInfo') doiInfo;
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
   * publication has no DOI or Title, or it the current publication has no journal with a
   * journalName
   */
  shouldSetPublication() {
    const publication = this.publication;
    return !publication || !publication.doi || !publication.title || !get(publication, 'journal.journalName');
  }

  constructor() {
    super(...arguments);

    this.setupConfig();
  }

  async setupConfig() {
    let config = await this.appStaticConfig.getStaticConfig();
    this.contactUrl = config.branding.pages.contactUrl;
  }

  @action
  setupSubmission() {
    if (!this.isProxySubmission) {
      set(this, 'submission.submitter', get(this, 'currentUser.user'));
      set(this, 'submission.preparers', A());
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
     * with a Publication and a Journal. We need to make sure that this journal makes it
     * into 'doiInfo' so it can be used in later steps.
     *
     * Only do this if there is no publication DOI, as the DOI lookup will cover this case.
     */
    if (!get(this, 'publication.doi') && this.journal) {
      this.selectJournal(this.journal);
    }
  }

  get isValidDOI() {
    return !this.doiServiceError && this.doiService.isValidDOI(get(this, 'publication.doi'));
  }

  get titleClass() {
    return (this.flaggedFields.indexOf('title') > -1) ? 'form-control is-invalid' : 'form-control';
  }

  get journalClass() {
    return (this.flaggedFields.indexOf('journal') > -1) ? 'is-invalid' : 'is-valid';
  }

  get submitterEmailClass() {
    return (this.flaggedFields.indexOf('submitterEmail') > -1) ? 'is-invalid' : '';
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
      this.args.updateDoiInfo({});
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
      journal: undefined
    });
  }

  @action
  proxyStatusToggled(isProxySubmission) {
    // do only if the values indicate a switch of proxy
    if (this.isProxySubmission && !isProxySubmission || !this.isProxySubmission && isProxySubmission) {
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
      let result = swal({
        type: 'warning',
        title: 'Are you sure?',
        html: 'Changing the submitter will also <strong>remove any grants</strong> currently attached to your submission. Are you sure you want to proceed?',
        showCancelButton: true,
        cancelButtonText: 'Never mind',
        confirmButtonText: 'Yes, I\'m sure'
      });

      if (result.value) {
        set(this, 'submission.grants', A());
        this.updateSubmitterModel(isProxySubmission, submitter);
        toastr.info('Submitter and related grants removed from submission.');
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
      this.submission.preparers = A([get(this, 'currentUser.user')]);
    } else {
      this.submission.submitter = get(this, 'currentUser.user');
      this.submission.preparers = A();
    }
  }

  /** Sets the selected journal for the current publication.
   * @param journal {DS.Model} The journal
   */
  @action
  selectJournal(journal) {
    let doiInfo = this.doiInfo;
    // Formats metadata and adds journal metadata
    let metadata = this.doiService.doiToMetadata(doiInfo, journal);
    metadata['journal-title'] = get(journal, 'journalName');
    doiInfo = this.metadataSchema.mergeBlobs(doiInfo, metadata);

    this.args.updateDoiInfo(doiInfo);

    const publication = this.publication;
    publication.journal = journal;
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

      toastr.info('Please wait while we look up information about your DOI', '', {
        timeOut: 0,
        extendedTimeOut: 0
      });

      const result = yield doiService.get('resolveDOI').perform(doi);

      if (setPublication) {
        this.args.updatePublication(result.publication);
      }

      this.args.updateDoiInfo(result.doiInfo);
      get(this, 'workflow').setFromCrossref(true);

      toastr.remove();
      toastr.success('We\'ve pre-populated information from the DOI provided!');
      this.args.validateTitle();
      this.args.validateJournal();
    } catch (error) {
      console.log(`DOI service request failed: ${error.payload.error}`);
      toastr.remove();

      this.clearDoiData(this.publication.doi);
      set(this, 'doiServiceError', error.payload.error);
      // eslint-disable-next-line newline-per-chained-call
    }
  }
}
