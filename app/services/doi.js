import Service from '@ember/service';
/**
 * Sample DOI data as JSON: https://gist.github.com/jabrah/c268c6b027bd2646595e266f872c883c
 */
export default Service.extend({
  resolveDOI(doi) {
    const base = 'https://doi.org/';
    doi = this.formatDOI(doi);

    return fetch(base + encodeURI(doi), {
      redirect: 'follow',
      headers: { Accept: 'application/vnd.citationstyles.csl+json' }
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) return response;
        throw new Error(`DOI lookup failed on ${response.url} status ${response.status}`);
      })
      .then(response => response.json());
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
  }
});
