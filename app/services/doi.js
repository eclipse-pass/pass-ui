import { isArray } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';
import { task } from 'ember-concurrency';

/**
 * This service contains functions for interacting with Crossref and manipulating Crossref
 * data. For example, #createPublication has knowledge of the data mapping between Crossref
 * data and Publication fields.
 *
 * Sample DOI data as JSON: https://gist.github.com/jabrah/c268c6b027bd2646595e266f872c883c
 */
export default Service.extend({
  store: service('store'),
  ajax: service(),

  doiServiceUrl: ENV.doiService.url,
  metadataSchemaUri: ENV.metadataSchemaUri,

  /**
  * resolveDOI - Lookup information about a DOI using the PASS doi service. Return that information along
  * with a publication. The publication will have a persisted journal set, but will not itself be persisted. The doi information
  * is in a normalized crossref format. (The normalization collaspses the array values of some keys to string values.)
  * The raw crossref format is defined here: https://github.com/CrossRef/rest-api-doc/blob/master/api_format.md
  *
  * @param  {string} doi
  * @returns {object}    Object with doiInfo and publication
  */
  resolveDOI: task(function* (doi) {
    let url = `${this.get('doiServiceUrl')}?doi=${encodeURIComponent(doi)}`;

    let response = yield this.get('ajax').request(url, 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8',
        withCredentials: 'include'
      }
    });

    let journal = yield this.get('store').findRecord('journal', response['journal-id']);

    let doiInfo = this._processRawDoi(response.crossref.message);

    // Needed by schemas
    doiInfo['journal-title'] = doiInfo['container-title'];

    let publication = this.get('store').createRecord('publication', {
      doi,
      journal,
      title: Array.isArray(doiInfo.title) ? doiInfo.title.join(', ') : doiInfo.title,
      submittedDate: doiInfo.deposited,
      creationDate: doiInfo.created,
      issue: doiInfo.issue,
      volume: doiInfo.volume,
      abstract: doiInfo.abstract,
    });

    return {
      publication,
      doiInfo
    };
  }),

  isValidDOI(doi) {
    // ref: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
    const newDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
    const ancientDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.1002\/[^\s]+$/i;
    if (doi == null || !doi) {
      return false;
    } else if (newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) {
      return true;
    }
    return false;
  },

  formatDOI(doi) {
    doi = doi.trim();
    doi = doi.replace(/doi:/gi, '');
    doi = doi.replace(/https?:\/\/(dx\.)?doi\.org\//gi, '');
    return doi;
  },

  /**
   * Transform crossref metadata to a metadata blob that can be attached to a submission.
   * Generally the keys are just copied as is, but in some case they are transformed so
   * the blob matches the form expected by the repository schemas. ISSNs are grabbed from
   * the Journal, not the crossref metadata.
   *
   * @param {object} doiInfo data retreived from the DOI
   * @param {object} journal Journal associated with publication
   * @param {array} validFields OPTIONAL array of accepted property names on final metadata object
   * @returns {object} metadata blob seeded with DOI data
   */
  doiToMetadata(doiInfo, journal, validFields) {
    const doiCopy = Object.assign({}, doiInfo);

    // Add issns key in expected format by parsing journal issns.
    doiCopy.issns = [];
    if (isArray(journal.get('issns'))) {
      journal.get('issns').forEach((s) => {
        let i = s.indexOf(':');
        let value = {};

        if (i == -1) {
          value.issn = s;
        } else {
          let prefix = s.substring(0, i);

          if (prefix === 'Print') {
            value.pubType = 'Print';
          } else if (prefix === 'Online') {
            value.pubType = 'Online';
          }

          value.issn = s.substring(i + 1);
        }

        if (value.issn.length > 0) {
          doiCopy.issns.push(value);
        }
      });
    }

    // Massage 'authors' information
    // Add expected properties and copy the field from 'author' to 'authors'
    if (Array.isArray(doiCopy.author)) {
      doiCopy.authors = [];
      doiCopy.author.forEach((author) => {
        let a = {
          author: `${author.given} ${author.family}`,
          orcid: author.ORCID
        };
        doiCopy.authors.push(Object.assign(a, author));
      });
    }

    // Misc manual translation
    if (doiCopy.nlmta) {
      doiCopy['journal-NLMTA-ID'] = doiCopy.nlmta;
    } else if (journal.get('nlmta')) {
      doiCopy['journal-NLMTA-ID'] = journal.get('nlmta');
    }
    if (doiCopy['container-title-short']) {
      doiCopy['journal-title-short'] = doiCopy['container-title-short'];
    }
    if (doiCopy.issued && doiCopy.issued['date-parts']) {
      const parts = doiCopy.issued['date-parts'];
      doiCopy.publicationDate = parts.flat().join('-');
    }

    doiCopy.doi = doiCopy.DOI;

    // Remove "invalid" properties if given a list of valid fields
    if (validFields && Array.isArray(validFields) && validFields.length > 0) {
      Object.keys(doiCopy).filter(key => !validFields.includes(key))
        .forEach(key => delete doiCopy[key]);
    }

    doiCopy.$schema = this.get('metadataSchemaUri');

    return doiCopy;
  },

  getJournalTitle(doiInfo) {
    return this._maybeArrayToString('journal-title', doiInfo);
  },

  getTitle(doiInfo) {
    return this._maybeArrayToString('title', doiInfo);
  },

  /**
   * Crossref seems to like having properties set to arrays of strings, even if you expect a
   * simple string, like for 'title' or 'journal name'. Here, if you know that a certain
   * Crossref property is an array of strings, just stringify the array ...
   *
   * @param {string} prop desired property name
   * @param {object} doiInfo data from Crossref
   * @returns {string} get a stringified value from a possible array of strings
   */
  _maybeArrayToString(prop, doiInfo) {
    const val = doiInfo[prop];

    if (Array.isArray(val)) {
      return val.join(' ');
    } else if (typeof val === 'string') {
      return val.trim();
    }

    return undefined;
  },

  /**
   * Process the DOI data object by 'transforming' select arrays to string values.
   *
   * @param {object} data DOI data from Crossref
   * @returns {object} return the processed DOI data
   */
  _processRawDoi(data) {
    const toProcess = ['container-title', 'short-container-title', 'title', 'original-title', 'short-title'];

    toProcess.filter(key => data.hasOwnProperty(key))
      .forEach((key) => {
        data[key] = this._maybeArrayToString(key, data);
      });

    data['journal-title'] = data['container-title'];

    return data;
  }
});
