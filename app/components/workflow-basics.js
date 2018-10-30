import WorkflowComponent from './workflow-component';
import { inject as service, } from '@ember/service';


function resolve(submission) {
  const base = 'https://doi.org/';

  let doi = submission.get('doi');
  if (!doi) {
    return Promise.reject(new Error('No DOI present'));
  }
  doi = doi.replace(/https?:\/\/(dx\.)?doi\.org\//gi, '');

  return fetch(base + encodeURI(doi), {
    redirect: 'follow',
    headers: {
      Accept: 'application/vnd.citationstyles.csl+json',
    },
  }).then((response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }).then(response => response.json());
}

export default WorkflowComponent.extend({
  store: service('store'),
  doiJournal: false,
  validDOI: 'form-control',
  isValidDOI: false,
  validTitle: 'form-control',
  toast: service('toast'),
  errorHandler: service('error-handler'),
  nextDisabled: Ember.computed('model.publication.journal', 'model.publication.title', function () {
    if (
      this.get('model.publication.journal') &&
      this.get('model.publication.title')) {
      return false;
    }
    return true;
  }),
  init() {
    this._super(...arguments);
  },
  didRender() {
    this._super(...arguments);
    this.send('validateDOI');
  },
  didInsertElement() {
    this._super(...arguments);
    this.send('lookupDOI');
  },
  actions: {
    validateNext() {
      const title = this.get('model.publication.title');
      const journal = this.get('model.publication.journal');
      let validTitle = false;
      let validJournal = false;

      if (journal.get('journalName') == null) {
        toastr.warning('The journal must not be left blank');
        validJournal = false;
        $('.ember-power-select-trigger').css('border-color', '#f86c6b');
      } else {
        validJournal = true;
        $('.ember-power-select-trigger').css('border-color', '#4dbd74');
      }

      if (title == null) {
        toastr.warning('The title must not be left blank');
        this.set('validTitle', 'form-control is-invalid');
        validTitle = false;
      } else if (title.length > 3) {
        validTitle = true;
        this.set('validTitle', 'form-control is-valid');
      } else {
        toastr.warning('Title must be longer then 3 characters');
        validTitle = false;
        this.set('validTitle', 'form-control is-invalid');
      }

      if (validTitle && validJournal) {
        this.send('next');
      }
    },
    next() {
      if (!this.get('doiInfo.title')) {
        this.set('doiInfo.title', this.get('model.publication.title'));
      }
      // if (!this.get('doiInfo.author')) {
      //   this.set('doiInfo.author', []);
      // }
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
      } else if (newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) { // 1 - Accepted
        this.set('validDOI', 'form-control is-valid');
        $('.ember-power-select-trigger').css('border-color', '#4dbd74');
        this.set('validTitle', 'form-control is-valid');
        this.set('model.newSubmission.metadata', '[]');
        this.set('isValidDOI', true);
        toastr.success('We\'ve pre-populated information from the DOI provided!');
      } else {
        this.set('validDOI', 'form-control is-invalid');
        this.set('isValidDOI', false);
      }
    },
    validateTitle() {
      const title = this.get('model.publication.title');
      this.set('validTitle', title == null || title.length > 5);
      // if(validTitle)
      if (title == null) {
        this.set('validTitle', 'form-control');
      } else if (title.length > 3) {
        this.set('validTitle', 'form-control is-valid');
      } else {
        this.set('validTitle', 'form-control is-invalid');
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
      if (publication) {
        this.send('validateDOI');
        this.set('doiJournal', false);
        resolve(publication).then(async (doiInfo) => {
          if (doiInfo.isDestroyed) {
            return;
          }
          const nlmtaDump = await this.getNlmtaFromIssn(doiInfo);
          if (nlmtaDump) {
            doiInfo.nlmta = nlmtaDump.nlmta;
            doiInfo['issn-map'] = nlmtaDump.map;
          }
          // // Crappy hack to rename property 'container-title' (received from DOI)
          // // to 'journal-title' that is expected by the back end services
          doiInfo['journal-title'] = doiInfo['container-title'];

          this.set('doiInfo', doiInfo);
          // useful console.log
          // console.log(doiInfo);
          publication.set('title', doiInfo.title);

          publication.set('submittedDate', doiInfo.deposited);
          publication.set('creationDate', doiInfo.created);

          publication.set('issue', doiInfo.issue);
          publication.set('volume', doiInfo.volume);
          publication.set('abstract', doiInfo.abstract);

          const desiredName = doiInfo['container-title'].trim();
          const desiredIssn = Array.isArray(doiInfo['ISSN']) ? doiInfo['ISSN'][0] : // eslint-disable-line
            (doiInfo['ISSN'] ? doiInfo['ISSN'] : ''); // eslint-disable-line

          let query = {
            bool: {
              should: [{ match: { journalName: desiredName } }],
              // must: { term: { issns: desiredIssn } }
            }
          };
          if (desiredIssn) {
            query.bool.must = { term: { issns: desiredIssn } };
          }
          // Must match ISSN, optionally match journalName
          this.get('store').query('journal', { query }).then((journals) => {
            let journal = journals.get('length') > 0 ? journals.objectAt(0) : false;
            if (!journal) {
              const newJournal = this.get('store').createRecord('journal', {
                journalName: doiInfo['container-title'].trim(),
                issns: doiInfo.ISSN,
                nlmta: doiInfo.nmlta,
              });
              newJournal.save().then(j => publication.set('journal', j));
            } else {
              publication.set('journal', journal);
            }
          });
        });
      }
    },

    /** Sets the selected journal for the current publication.
     * @param journal {DS.Model} The journal
     */
    async selectJournal(journal) {
      let doiInfo = this.get('doiInfo');
      doiInfo = {
        'journal-title': journal.get('journalName'),
        ISSN: journal.get('issns')
      };

      const nlmtaDump = await this.getNlmtaFromIssn(doiInfo);
      if (nlmtaDump) {
        doiInfo.nlmta = nlmtaDump.nlmta;
        doiInfo['issn-map'] = nlmtaDump.map;
      }
      this.set('doiInfo', doiInfo);

      const publication = this.get('model.publication');
      publication.set('journal', journal);
      $('.ember-power-select-trigger').css('border-color', '#4dbd74');
    },
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
    if (!nlmidMap || (nlmidMap.length === 0)) {
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
      data.issnlist.filter(item => item.issntype !== 'Linking').forEach((item) => {
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
    if (Array.isArray(nlmid)) {
      idquery = nlmid.join(',');
    }
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nlmcatalog&retmode=json&rettype=abstract&id=${idquery}`;
    return fetch(url)
      .then(resp => resp.json().then(data => data.result))
      .catch((e) => {
        console.log('NLMTA lookup failed.', e);
      });
  }
});
