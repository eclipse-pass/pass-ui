import { A } from '@ember/array';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  currentUser: service('current-user'),
  doiService: service('doi'),
  metadataService: service('metadata-schema'),
  configurator: service('app-static-config'),

  assetsUri: null,

  inFlight: false,
  doiServiceError: false,
  isShowingUserSearchModal: false,

  isProxySubmission: computed('submission.isProxySubmission', function () {
    return this.get('submission.isProxySubmission');
  }),
  inputSubmitterEmail: computed('submission.submitterEmail', {
    get(key) {
      return this.get('submission.submitterEmail').replace('mailto:', '');
    },
    set(key, value) {
      this.set('submission.submitterEmail', `mailto:${value}`);
      return value;
    }
  }),

  /**
   * Publication should be set/overwritten if there is no current publication, if the current
   * publication has no DOI or Title, or it the current publication has no journal with a
   * journalName
   */
  shouldSetPublication() {
    const publication = this.get('publication');
    return !publication || !publication.get('doi') || !publication.get('title') || !publication.get('journal.journalName');
  },

  init() {
    this._super(...arguments);
    this.get('configurator').getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  },

  didRender() {
    this._super(...arguments);
    if (!this.get('isProxySubmission')) {
      this.set('submission.submitter', this.get('currentUser.user'));
      this.set('submission.preparers', A());
    }
  },
  didInsertElement() {
    this._super(...arguments);

    this.get('workflow').setFromCrossref(false);

    const shouldSet = this.shouldSetPublication();
    this.lookupDoiAndJournal(shouldSet);
  },

  /**
   * Look up the known DOI in Crossref to get metadata, as well as the expected Publication object
   * and associated Journal.
   *
   * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
   */
  lookupDoiAndJournal(setPublication) {
    this.send('lookupDOI', setPublication);
    /**
     * If a Journal object exists in the model, then we have loaded an existing Submission
     * with a Publication and a Journal. We need to make sure that this journal makes it
     * into 'doiInfo' so it can be used in later steps.
     *
     * Only do this if there is no publication DOI, as the DOI lookup will cover this case.
     */
    if (!this.get('publication.doi') && this.get('journal')) {
      this.send('selectJournal', this.get('journal'));
    }
  },

  isValidDOI: computed('publication.doi', 'doiServiceError', function () {
    return !this.get('doiServiceError') && this.get('doiService').isValidDOI(this.get('publication.doi'));
  }),
  titleClass: computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('title') > -1) ? 'form-control is-invalid' : 'form-control');
  }),
  journalClass: computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('journal') > -1) ? 'is-invalid' : 'is-valid');
  }),
  submitterEmailClass: computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('submitterEmail') > -1) ? 'is-invalid' : '');
  }),
  doiClass: computed('isValidDOI', function () {
    let doi = this.get('publication.doi');
    if (doi == null || !doi) {
      return 'form-control';
    } else if (this.get('isValidDOI') === true) {
      return 'form-control is-valid';
    }
    return 'form-control is-invalid';
  }),

  clearDoiData(doi) {
    const workflow = this.get('workflow');

    if (workflow.isDataFromCrossref()) {
      workflow.setFromCrossref(false);
      this.set('doiInfo', {});
      this.set('submission.metadata', '{}');
      this.clearPublication(doi);
    }
  },

  /**
   * Remove all data from the current Publication
   */
  clearPublication(doi) {
    this.get('publication').setProperties({
      doi,
      title: '',
      abstract: '',
      volume: '',
      issue: '',
      pmid: '',
      journal: undefined
    });
  },

  actions: {
    proxyStatusToggled(isProxySubmission) {
      // do only if the values indicate a switch of proxy
      if (this.get('isProxySubmission') && !isProxySubmission || !this.get('isProxySubmission') && isProxySubmission) {
        this.send('changeSubmitter', isProxySubmission, null);
      }
    },
    toggleUserSearchModal() {
      this.toggleProperty('isShowingUserSearchModal');
    },
    pickSubmitter(submitter) {
      this.send('changeSubmitter', true, submitter);
      this.send('toggleUserSearchModal');
      this.set('userSearchTerm', '');
      this.sendAction('validateSubmitterEmail'); // remove red border if there is one
    },
    async changeSubmitter(isProxySubmission, submitter) {
      let hasGrants = this.get('submission.grants') && this.get('submission.grants.length') > 0;
      if (hasGrants) {
        swal({
          type: 'warning',
          title: 'Are you sure?',
          html: 'Changing the submitter will also <strong>remove any grants</strong> currently attached to your submission. Are you sure you want to proceed?',
          showCancelButton: true,
          cancelButtonText: 'Never mind',
          confirmButtonText: 'Yes, I\'m sure'
        }).then((result) => {
          if (result.value) {
            this.set('submission.grants', A());
            this.send('updateSubmitterModel', isProxySubmission, submitter);
            toastr.info('Submitter and related grants removed from submission.');
          }
        });
      } else {
        this.send('updateSubmitterModel', isProxySubmission, submitter);
      }
    },
    updateSubmitterModel(isProxySubmission, submitter) {
      this.get('workflow').setMaxStep(1);
      this.set('submission.submitterEmail', '');
      this.set('submission.submitterName', '');
      if (isProxySubmission) {
        this.set('submission.submitter', submitter);
        this.set('submission.preparers', A([this.get('currentUser.user')]));
      } else {
        this.set('submission.submitter', this.get('currentUser.user'));
        this.set('submission.preparers', A());
      }
    },

    /**
     * lookupDOI - Set publication, publication journal, and doiInfo based on DOI.
     *
     * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
     */
    lookupDOI(setPublication) {
      this.set('doiServiceError', false);
      if (this.get('inFlight')) {
        console.log('%cA request is already in flight, ignoring this call', 'color:blue;');
        return;
      }

      const publication = this.get('publication');
      if (!publication || !publication.get('doi')) {
        // Note that any metadata now does NOT come from Xref
        this.clearDoiData();
        return;
      }

      const doiService = this.get('doiService');
      let doi = publication.get('doi');

      doi = doiService.formatDOI(doi);
      if (!doi || doi === '' || doiService.isValidDOI(doi) === false) {
        this.clearDoiData(doi); // Clear out title/Journal if user enters a valid DOI, then changes it to an invalid DOI
        return;
      }

      publication.set('doi', doi);
      this.set('inFlight', true);

      toastr.info('Please wait while we look up information about your DOI', '', {
        timeOut: 0,
        extendedTimeOut: 0
      });
      doiService.get('resolveDOI').perform(doi).then(async (result) => {
        if (setPublication) {
          this.set('publication', result.publication);
        }

        this.set('doiInfo', result.doiInfo);
        this.get('workflow').setFromCrossref(true);

        toastr.remove();
        toastr.success('We\'ve pre-populated information from the DOI provided!');
        this.sendAction('validateTitle');
        this.sendAction('validateJournal');
      }).catch((error) => {
        console.log(`DOI service request failed: ${error.payload.error}`);
        toastr.remove();

        this.clearDoiData(doi);
        this.set('doiServiceError', error.payload.error);
      // eslint-disable-next-line newline-per-chained-call
      }).finally(() => this.set('inFlight', false));
    },

    /** Sets the selected journal for the current publication.
     * @param journal {DS.Model} The journal
     */
    selectJournal(journal) {
      let doiInfo = this.get('doiInfo');
      // Formats metadata and adds journal metadata
      let metadata = this.get('doiService').doiToMetadata(doiInfo, journal);
      metadata['journal-title'] = journal.get('journalName');
      doiInfo = this.get('metadataService').mergeBlobs(doiInfo, metadata);

      this.set('doiInfo', doiInfo);

      const publication = this.get('publication');
      publication.set('journal', journal);
      this.sendAction('validateJournal');
    },

    cancel() {
      this.sendAction('abort');
    }
  }
});
