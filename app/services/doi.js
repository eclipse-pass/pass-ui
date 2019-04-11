import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

/**
 * Sample DOI data as JSON: https://gist.github.com/jabrah/c268c6b027bd2646595e266f872c883c
 */
export default Service.extend({
  base: 'https://api.crossref.org/',

  // Crossref API has multiple 'prefixes' you can use to get different pieces of information
  // At the moment, we only care about 'works'
  basicPrefix: 'works/',

  /**
   * Crossref API strongly suggests attaching at least some mailto credentials to requests.
   * Without this information, Crossref will throttle requests.
   */
  userAgent() {
    return `OA-PASS (mailto:${ENV.brand.mailto})`;
  },

  /**
   * NOTE: There may be a browser bug in Chrome(?) that prevents us from setting the 'User-Agent'
   * header. For now, we can attach 'mailto' info as URI query parameter, per the Crossref API.
   *
   * Sample Crossref response can is linked above
   *
   * IMPL NOTE: Rerturning the JSON object is done in two stages (two separate 'then') because
   * `response.json()` returns a Promise
   *
   * @param {string} doi DOI URI
   * @returns {promise} get a promise that will returned a parsed JSON object
   */
  resolveDOI(doi) {
    const eDoi = encodeURI(doi);
    const url = `${this.get('base')}${this.get('basicPrefix')}${eDoi}?mailto=${ENV.brand.mailto}`;
    // const headers = new Headers({
    //   'User-Agent': this.userAgent()
    // });

    return fetch(url, {
      method: 'GET',
      // headers // There may be a bug in Chrome that prevents setting the 'User-Agent' header
    })
      .then(response => response.json()) // TODO: should we do some preprocessing of the DOI data here?
      .then(json => this._processRawDoi(json.message));
  },

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
   * Translate data from the DOI to a metadata blob that can be attached to a submission.
   *
   * @param {object} doiInfo data retreived from the DOI
   * @param {array} validFields OPTIONAL array of accepted property names on final metadata object
   * @returns {object} metadata blob seeded with DOI data
   */
  doiToMetadata(doiInfo, validFields) {
    const doiCopy = Object.assign({}, doiInfo);
    // Massage ISSN data
    let issns = [];
    if (doiCopy['issn-map']) {
      Object.keys(doiCopy['issn-map']).forEach(issn => issns.push({
        issn,
        pubType: doiCopy['issn-map'][issn]['pub-type'][0]
      }));
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

    doiCopy.issns = issns;

    // Misc manual translation
    doiCopy['journal-NLMTA-ID'] = doiCopy.nlmta;
    doiCopy['journal-title-short'] = doiCopy['container-title-short'];
    doiCopy.doi = doiCopy.DOI;

    // Remove "invalid" properties if given a list of valid fields
    if (validFields && Array.isArray(validFields) && validFields.length > 0) {
      Object.keys(doiCopy).filter(key => !validFields.includes(key))
        .forEach(key => delete doiCopy[key]);
    }

    return doiCopy;
    // Manual mapping of DOI data to fields expected by our metadata forms
    // return {
    //   abstract: doiInfo.abstract,
    //   authors: doiInfo.authors,
    //   issns,
    //   'journal-NLMTA-ID': doiInfo.nlmta,
    //   doi: doiInfo.DOI,
    //   publisher: doiInfo.publisher,
    //   'journal-title-short': doiInfo['container-title-short'],
    //   'journal-title': doiInfo['journal-title'],
    //   title: doiInfo.title,
    //   issue: doiInfo.issue,
    //   volume: doiInfo.volume
    // };
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
