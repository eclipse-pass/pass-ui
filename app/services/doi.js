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
  }
});
