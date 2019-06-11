import Component from '@ember/component';
import { inject as service } from '@ember/service';

/**
 * IMPL NOTE:
 * An interesting thing to consider: say a user goes through the submission workflow and ends up filling
 * out some custom values in the metadata fields presented to them. The user then leaves the workflow
 * leaving us with a 'draft' submission that can be resumed later. When we re-enter the submission
 * workflow, we don't want to clobber the user-entered metadata.
 *
 * If submission metadata exists, it means the user at least made it past the metadata details step
 * in the workflow. In this case, we should trust this metadata over data from the DOI service. Since
 * data from the DOI is used to seed the metadata step, we can be sure that this data already exists
 * in the submission metadata.
 *
 * If we find either NO metadata or an empty object, then we must look up the DOI to get the
 * metadata, but NOT act on the Publication or Journal objects received from the doi service.
 *
 * TODO: these cumulative issues require pretty ugly and round-about fixes making the code
 * hard to follow. This component needs to be cleaned up so these workaround pathways are not
 * required.
 */
export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  currentUser: service('current-user'),
  doiService: service('doi'),
  metadataService: service('metadata-schema'),

  inFlight: false,
  isShowingUserSearchModal: false,

  isProxySubmission: Ember.computed('submission.isProxySubmission', function () {
    return this.get('submission.isProxySubmission');
  }),
  inputSubmitterEmail: Ember.computed('submission.submitterEmail', {
    get(key) {
      return this.get('submission.submitterEmail').replace('mailto:', '');
    },
    set(key, value) {
      this.set('submission.submitterEmail', `mailto:${value}`);
      return value;
    }
  }),
  didRender() {
    this._super(...arguments);
    if (!this.get('isProxySubmission')) {
      this.set('submission.submitter', this.get('currentUser.user'));
      this.set('submission.preparers', Ember.A());
    }
  },
  didInsertElement() {
    this._super(...arguments);

    const publication = this.get('submission.publication');
    const hasPublication = !!(publication && publication.get('doi'));
    /**
     * See IMPL NOTE above regarding the existance of submission metadata
     */
    try {
      const md = JSON.parse(this.get('submission.metadata'));

      /**
       * Set workflow doiInfo because of some weird timing between `routes/submissions/new/index#beforeModel`
       * and `routes/submissions/new#model()` causing the doiInfo in 'workflow' to reset after it is
       * defined by the incoming submission
       */
      this.get('workflow').setDoiInfo(md);

      /**
       * Check to see if incoming metadata is an empty object. If metadata is an empty object, then
       * we still need to load DOI, but may not have to set the returned Publication object.
       */
      if (Object.entries(md).length === 0 && md.constructor === Object) {
        this.lookupDoiAndJournal(!hasPublication);
      }
    } catch (e) {
      // Either 'metadata' is missing or malformed
      this.lookupDoiAndJournal(!hasPublication);
    }
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

  isValidDOI: Ember.computed('publication.doi', function () {
    return this.get('doiService').isValidDOI(this.get('publication.doi'));
  }),
  titleClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('title') > -1) ? 'form-control is-invalid' : 'form-control');
  }),
  journalClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('journal') > -1) ? 'is-invalid' : 'is-valid');
  }),
  submitterEmailClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('submitterEmail') > -1) ? 'is-invalid' : '');
  }),
  doiClass: Ember.computed('isValidDOI', function () {
    let doi = this.get('publication.doi');
    if (doi == null || !doi) {
      return 'form-control';
    } else if (this.get('isValidDOI') === true) {
      return 'form-control is-valid';
    }
    return 'form-control is-invalid';
  }),
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
            this.set('submission.grants', Ember.A());
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
        this.set('submission.preparers', Ember.A([this.get('currentUser.user')]));
      } else {
        this.set('submission.submitter', this.get('currentUser.user'));
        this.set('submission.preparers', Ember.A());
      }
    },

    /**
     * lookupDOI - Set publication, publication journal, and doiInfo based on DOI.
     *
     * @param {boolean} setPublication DOI lookup should set the Publication object on the submission
     */
    lookupDOI(setPublication) {
      if (this.get('inFlight')) {
        console.log('%cA request is already in flight, ignoring this call', 'color:blue;');
        return;
      }

      const publication = this.get('publication');
      if (!publication || !publication.get('doi')) {
        return;
      }

      const doiService = this.get('doiService');
      let doi = publication.get('doi');

      doi = doiService.formatDOI(doi);
      if (!doi || doi === '' || doiService.isValidDOI(doi) === false) {
        return;
      }

      publication.set('doi', doi);
      this.set('submission.metadata', '{}');
      this.set('inFlight', true);

      doiService.resolveDOI(doi).then(async (result) => {
        if (setPublication) {
          this.set('publication', result.publication);
        }

        this.set('doiInfo', result.doiInfo);

        toastr.success("We've pre-populated information from the DOI provided!");
        this.sendAction('validateTitle');
        this.sendAction('validateJournal');
      }).catch((error) => {
        console.log(`DOI service request failed: ${error.payload.error}`);
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
