import Component from '@ember/component';
import { inject as service } from '@ember/service';

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
  currentUser: service('current-user'),
  validDOI: 'form-control',
  isValidDOI: false,
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
  titleClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('title') > -1) ? 'form-control is-invalid' : 'form-control');
  }),
  journalClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('journal') > -1) ? 'is-invalid' : 'is-valid');
  }),
  submitterEmailClass: Ember.computed('flaggedFields', function () {
    return ((this.get('flaggedFields').indexOf('submitterEmail') > -1) ? 'is-invalid' : '');
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
            toast.info('Submitter and related grants removed from submission.');
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
    validateDOI() {
      // ref: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
      const doi = this.get('publication.doi');
      const newDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
      const ancientDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.1002\/[^\s]+$/i;
      // 0 = no value
      if (doi == null || !doi) {
        this.set('validDOI', 'form-control');
        this.set('isValidDOI', false);
      } else if (newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) {
        // 1 - Accepted
        this.set('validDOI', 'form-control is-valid');
        this.set('submission.metadata', '[]');
        this.set('isValidDOI', true);
      } else {
        this.set('validDOI', 'form-control is-invalid');
        this.set('isValidDOI', false);
      }
    },
    /** looks up the DIO and returns title and journal if avaiable */
    lookupDOI() {
      if (this.get('publication.doi')) {
        this.set('publication.doi', this.get('publication.doi').trim());
        this.set('publication.doi', this.get('publication.doi').replace(/doi:/gi, ''));
        this.set('publication.doi', this.get('publication.doi').replace(/https?:\/\/(dx\.)?doi\.org\//gi, ''));
      }
      const publication = this.get('publication');

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
          toast.success("We've pre-populated information from the DOI provided!");
          this.sendAction('validateTitle');
          this.sendAction('validateJournal');
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

      const publication = this.get('publication');
      publication.set('journal', journal);
      this.sendAction('validateJournal');
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
