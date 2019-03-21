import Service from '@ember/service';

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
   * @returns {object} metadata blob seeded with DOI data
   */
  doiToMetadata(doiInfo) {
    // Massage ISSN data
    let issns = [];
    if (doiInfo['issn-map']) {
      Object.keys(doiInfo['issn-map']).forEach(issn => issns.push({
        issn,
        pubType: doiInfo['issn-map'][issn]['pub-type'][0]
      }));
    }

    // Massage 'authors' information
    // Add expected properties and copy the field from 'author' to 'authors'
    if (Array.isArray(doiInfo.author)) {
      doiInfo.authors = [];
      doiInfo.author.forEach((author) => {
        let a = {
          author: `${author.given} ${author.family}`,
          orcid: author.ORCID
        };
        doiInfo.authors.push(Object.assign(a, author));
      });
    }

    doiInfo.issns = issns;
    // return doiInfo;
    // TODO: I don't really like this sort of manual copying, since we don't necessarily know what
    // future metadata forms are expecting
    return {
      abstract: doiInfo.abstract,
      authors: doiInfo.authors,
      issns,
      'journal-NLMTA-ID': doiInfo.nlmta,
      doi: doiInfo.DOI,
      publisher: doiInfo.publisher,
      'journal-title-short': doiInfo['container-title-short'],
      'journal-title': doiInfo['journal-title'],
      title: doiInfo.title,
      issue: doiInfo.issue,
      volume: doiInfo.volume
    };
  }
});
