import Component from '@ember/component';
import { inject as service } from '@ember/service';


export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  currentUser: service('current-user'),
  doiService: service('doi'),

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
    this.send('lookupDOI');
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
     */
    lookupDOI() {
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
      this.set('submission.metadata', '[]');
      this.set('inFlight', true);

      doiService.resolveDOI(doi).then(async (result) => {
        this.set('publication', result.publication);
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
    async selectJournal(journal) {
      let doiInfo = this.get('doiInfo');
      doiInfo = { 'journal-title': journal.get('journalName'), ISSN: journal.get('issns') };

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
