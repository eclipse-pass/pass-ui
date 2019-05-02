import Service from '@ember/service';

export default Service.extend({
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
