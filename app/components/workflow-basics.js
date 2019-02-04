import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';

function resolve(publication) {
  const base = 'https://doi.org/';

  let doi = publication.get('doi');
  doi = doi.replace(/https?:\/\/(dx\.)?doi\.org\//gi, '');

  return fetch(base + encodeURI(doi), {
    redirect: 'follow',
    headers: { Accept: 'application/vnd.citationstyles.csl+json' }
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) return response;
      throw new Error(`DOI lookup failed on ${response.url} status ${response.status}`);
    })
    .then(response => response.json());
}

export default Component.extend({
  store: service('store'),
  workflow: service('workflow'),
  errorHandler: service('error-handler'),
  currentUser: service('current-user'),
  toast: service('toast'),
  base: Ember.computed(() => ENV.fedora.elasticsearch),
  ajax: service('ajax'),
  validDOI: 'form-control',
  isValidDOI: false,
  validTitle: 'form-control',
  validEmail: '',
  // modal fields
  isShowingModal: false,
  modalPageSize: 30,
  modalTotalResults: 0,
  modalUsers: null,
  modalSearchInput: '',
  isProxySubmission: Ember.computed('model.newSubmission.isProxySubmission', function () {
    return this.get('model.newSubmission.isProxySubmission');
  }),
  inputSubmitterEmail: Ember.computed('model.newSubmission.submitterEmail', {
    get(key) {
      return this.get('model.newSubmission.submitterEmail').replace('mailto:', '');
    },
    set(key, value) {
      this.set('model.newSubmission.submitterEmail', `mailto:${value}`);
      return value;
    }
  }),
  doiInfo: Ember.computed('workflow.doiInfo', {
    get(key) {
      return this.get('workflow').getDoiInfo();
    },
    set(key, value) {
      this.get('workflow').setDoiInfo(value);
      return value;
    }
  }),
  maxStep: Ember.computed('workflow.maxStep', {
    get(key) {
      return this.get('workflow').getMaxStep();
    },
    set(key, value) {
      this.get('workflow').setMaxStep(value);
      return value;
    }
  }),
  // end modal fields
  didRender() {
    this._super(...arguments);
    this.send('validateDOI');

    // if there's no proxy, reset all proxy-popup-related fields
    if (!this.get('isProxySubmission')) {
      this.set('model.newSubmission.submitterEmail', '');
      this.set('model.newSubmission.submitterName', '');
      this.set('model.newSubmission.preparers', Ember.A());
    }
  },
  didInsertElement() {
    this._super(...arguments);
    this.send('lookupDOI');
  },
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  actions: {
    proxyStatusToggled(isProxySubmission) {
      // do only if the values indicate a switch of proxy
      if (this.get('isProxySubmission') && !isProxySubmission || !this.get('isProxySubmission') && isProxySubmission) {
        this.send('resetSubmitter', isProxySubmission);
      }
    },
    resetSubmitter(isProxySubmission) {
      let hasGrants = this.get('model.newSubmission.grants') && this.get('model.newSubmission.grants.length') > 0;
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
            this.set('model.newSubmission.grants', Ember.A());
            this.send('resetSubmitterModel', isProxySubmission);
            toastr.info('Submitter and related grants removed from submission.');
          }
        });
      } else {
        this.send('resetSubmitterModel', isProxySubmission);
      }
    },
    resetSubmitterModel(isProxySubmission) {
      this.set('maxStep', 1);
      this.set('model.newSubmission.submitterEmail', '');
      this.set('model.newSubmission.submitterName', '');
      if (isProxySubmission) {
        this.set('model.newSubmission.submitter', null);
        this.set('model.newSubmission.preparers', Ember.A([this.get('currentUser.user')]));
      } else {
        this.set('model.newSubmission.submitter', this.get('currentUser.user'));
        this.set('model.newSubmission.preparers', Ember.A());
      }
    },
    toggleModal() {
      this.toggleProperty('isShowingModal');
    },
    searchForUsers() {
      const size = this.get('modalPageSize');
      let info = {};
      let input = this.get('modalSearchInput');
      this.get('store').query('user', {
        query: {
          bool: {
            filter: {
              exists: { field: 'email' }
            },
            should: {
              multi_match: { query: input, fields: ['firstName', 'middleName', 'lastName', 'email', 'displayName'] }
            },
            minimum_should_match: 1
          }
        },
        from: 0,
        size,
        info
      }).then((users) => {
        this.set('users', users);
        this.set('isShowingModal', true);
        if (info.total !== null) this.set('modalTotalResults', info.total);
      });
    },
    async validateNext() {
      const title = this.get('model.publication.title');
      const journal = this.get('model.publication.journal');
      const isProxySubmission = this.get('isProxySubmission');

      // booleans
      const currentUserIsNotSubmitter = this.get('model.newSubmission.submitter.id') !== this.get('currentUser.user.id');
      const proxySubmitterInfoExists = this.get('model.newSubmission.submitterEmail') && this.get('model.newSubmission.submitterName');
      const userIsNotPreparer = !this.get('model.newSubmission.preparers').map(x => x.get('id')).includes(this.get('currentUser.user.id'));
      const submitterExists = this.get('model.newSubmission.submitter.id');
      const proxySubmitterExists = submitterExists && currentUserIsNotSubmitter;

      // A journal and title must be present
      if (!journal.get('id')) {
        toastr.warning('The journal must not be left blank');
        $('.ember-power-select-trigger').css('border-color', '#f86c6b');
      } else {
        $('.ember-power-select-trigger').css('border-color', '#4dbd74');
      }

      if (!title) {
        toastr.warning('The title must not be left blank');
        this.set('validTitle', 'form-control is-invalid');
      } else {
        this.set('validTitle', 'form-control is-valid');
      }

      // if either is missing, end function early.
      if (!journal.get('id') || !title) return;

      // If there's no submitter or submitter info and the submission is a new proxy submission:
      if (!(submitterExists || proxySubmitterInfoExists) && isProxySubmission) {
        toastr.warning('You have indicated that you are submitting on behalf of someone else, but have not chosen that someone.');
        return;
      }

      if (this.get('validEmail') === 'is-invalid') {
        toastr.warning('The email address you entered is invalid. Please verify the value and try again.');
        return;
      }
      if (isProxySubmission && userIsNotPreparer) {
        this.get('model.newSubmission.preparers').addObject(this.get('currentUser.user'));
      } else if (!isProxySubmission) {
        this.set('model.newSubmission.preparers', Ember.A());
        this.set('model.newSubmission.submitter', this.get('currentUser.user'));
      }
      // If there's no title in the information grabbed via DOI, use the title given by the user.
      if (!this.get('doiInfo.title')) this.set('doiInfo.title', this.get('model.publication.title'));
      // Move to the next form.
      this.sendAction('next');
    },
    next() {
      toastr.remove();
      this.sendAction('next');
    },
    validateDOI() {
      // ref: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
      const doi = this.get('model.publication.doi');
      const newDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
      const ancientDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.1002\/[^\s]+$/i;
      // 0 = no value
      if (doi == null || !doi) {
        this.set('validDOI', 'form-control');
        this.set('isValidDOI', false);
      } else if (newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) {
        // 1 - Accepted
        this.set('validDOI', 'form-control is-valid');
        $('.ember-power-select-trigger').css('border-color', '#4dbd74');
        this.set('validTitle', 'form-control is-valid');
        this.set('model.newSubmission.metadata', '[]');
        this.set('isValidDOI', true);
        toastr.success("We've pre-populated information from the DOI provided!");
      } else {
        this.set('validDOI', 'form-control is-invalid');
        this.set('isValidDOI', false);
      }
    },
    validateTitle() {
      const title = this.get('model.publication.title');
      if (title) { // if not null or empty, then valid
        this.set('validTitle', 'form-control is-valid');
      } else {
        this.set('validTitle', 'form-control is-invalid');
      }
    },
    validateEmail() {
      const email = this.get('inputSubmitterEmail');
      let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (email && emailPattern.test(email)) {
        this.set('validEmail', 'is-valid');
      } else if (email) {
        this.set('validEmail', 'is-invalid');
      } else {
        this.set('validEmail', '');
      }
    },
    /** looks up the DIO and returns title and journal if avaiable */
    lookupDOI() {
      if (this.get('model.publication.doi')) {
        this.set('model.publication.doi', this.get('model.publication.doi').trim());
        this.set('model.publication.doi', this.get('model.publication.doi').replace(/doi:/gi, ''));
        this.set('model.publication.doi', this.get('model.publication.doi').replace(/https?:\/\/(dx\.)?doi\.org\//gi, ''));
      }
      const publication = this.get('model.publication');

      if (publication && publication.get('doi')) {
        this.send('validateDOI');

        resolve(publication).then(async (doiInfo) => {
          if (doiInfo.isDestroyed) {
            return;
          }
          const nlmtaDump = await this.getNlmtaFromIssn(doiInfo);
          if (nlmtaDump) {
            doiInfo.nlmta = nlmtaDump.nlmta;
            doiInfo['issn-map'] = nlmtaDump.map;
          }
          doiInfo['journal-title'] = doiInfo['container-title'];
          this.set('doiInfo', doiInfo);
          publication.set('title', doiInfo.title);
          publication.set('submittedDate', doiInfo.deposited);
          publication.set('creationDate', doiInfo.created);
          publication.set('issue', doiInfo.issue);
          publication.set('volume', doiInfo.volume);
          publication.set('abstract', doiInfo.abstract);

          const desiredName = doiInfo['container-title'].trim();
          const desiredIssn = Array.isArray(doiInfo.ISSN) // eslint-disable-line
            ? doiInfo.ISSN[0]
            : doiInfo.ISSN
              ? doiInfo.ISSN
              : '';

          let query = { bool: { should: [{ match: { journalName: desiredName } }] } };
          if (desiredIssn) query.bool.must = { term: { issns: desiredIssn } };
          // Must match ISSN, optionally match journalName
          // If journal is found, set it to the publication's journal.
          // If journal is not found, make a journal based off the provided info and
          // set it to the publication's journal.
          this.get('store').query('journal', { query }).then((journals) => {
            let journal = journals.get('length') > 0 ? journals.objectAt(0) : false;
            if (!journal) {
              const newJournal = this.get('store').createRecord('journal', {
                journalName: doiInfo['container-title'].trim(),
                issns: doiInfo.ISSN,
                nlmta: doiInfo.nmlta
              });
              newJournal.save().then(j => publication.set('journal', j));
            } else {
              publication.set('journal', journal);
            }
          });
        }, (error) => {
          // console.log(error.message);
        }); // end resolve(publication).then()
      } // end if (publication)
    },

    /** Sets the selected journal for the current publication.
     * @param journal {DS.Model} The journal
     */
    async selectJournal(journal) {
      let doiInfo = this.get('doiInfo');
      doiInfo = { 'journal-title': journal.get('journalName'), ISSN: journal.get('issns') };

      const nlmtaDump = await this.getNlmtaFromIssn(doiInfo);
      if (nlmtaDump) {
        doiInfo.nlmta = nlmtaDump.nlmta;
        doiInfo['issn-map'] = nlmtaDump.map;
      }
      this.set('doiInfo', doiInfo);

      const publication = this.get('model.publication');
      publication.set('journal', journal);
      $('.ember-power-select-trigger').css('border-color', '#4dbd74');
    }
  },

  /**
   * Use various services to fetch NLMTA and pub-type for given ISSNs found
   * in the DOI data. This info will be merged in with the DOI data.
   *
   *  {
   *    ... // other DOI data
   *    "issn-map": {
   *      "nlmta": "",
   *      "map": {
   *        "<ISSN-1>": {
   *          "pub-type": [""]
   *        }
   *      }
   *    }
   *  }
   */
  async getNlmtaFromIssn(doiInfo) {
    const issnMap = {
      nlmta: undefined,
      map: {}
    };

    // DOI should give ISSN as array or single string (?)
    const issn = Array.isArray(doiInfo.ISSN) ? doiInfo.ISSN[0] : doiInfo.ISSN;

    // Map of NLMIDs to objects
    // Example: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nlmcatalog&term=0006-2952[issn]
    const nlmidMap = await this.getNLMID(issn);
    if (!nlmidMap || nlmidMap.length === 0) {
      return;
    }
    // Example: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nlmcatalog&retmode=json&rettype=abstract&id=101032
    const idmap = await this.getNLMTA(nlmidMap);
    nlmidMap.forEach((id) => {
      const data = idmap[id];
      if (!idmap) {
        return;
      }
      issnMap.nlmta = data.medlineta;
      data.issnlist
        .filter(item => item.issntype !== 'Linking')
        .forEach((item) => {
          issnMap.map[item.issn] = { 'pub-type': [item.issntype] };
        });
    });

    return issnMap;
  },
  /**
   * TODO What happens if 'idlist' contains more than one ID?
   * @param issn {string}
   */
  getNLMID(issn) {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nlmcatalog&term=${issn}[issn]&retmode=json`;
    return fetch(url)
      .then(resp => resp.json().then(data => data.esearchresult.idlist))
      .catch((e) => {
        console.log('NLMTA lookup failed.', e);
      });
  },
  getNLMTA(nlmid) {
    let idquery = nlmid;
    if (Array.isArray(nlmid)) idquery = nlmid.join(',');
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nlmcatalog&retmode=json&rettype=abstract&id=${idquery}`;

    return fetch(url)
      .then(resp => resp.json().then(data => data.result))
      .catch((e) => {
        console.log('NLMTA lookup failed.', e);
      });
  }
});
