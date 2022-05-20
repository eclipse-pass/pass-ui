import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default class OAManuscriptService extends Service {
  lookupUrl = ENV.oaManuscriptService.lookupUrl;

  constructor() {
    super(...arguments);

    console.assert(
      'lookupUrl' in ENV.oaManuscriptService,
      '%cOpen Access Manuscript service lookup URL not found',
      'color: red;'
    );
    console.assert(
      'downloadUrl' in ENV.oaManuscriptService,
      '%cOpen Access Manuscript service download URL not found',
      'color: red;'
    );
  }

  /**
   * Get a list of open access copies for the given DOI
   *
   * @param {string} doi
   * @returns {array} [
   *    {
   *      url: '', // URL where the manuscript can be retrieved
   *      name: '', // File name
   *      type: '', // MIME-type of the file
   *      source: '', // Where we found this manuscript (e.g. "Unpaywall")
   *      repositoryLabel: '' // Human readable name of the repository where the manuscript is stored
   *    }
   *  ]
   */
  lookup(doi) {
    console.assert(!!this.lookupUrl, '%cOA Manuscript service lookup for DOIs not found.', 'color: red;');
    console.assert(!!doi, '%cNo DOI was provided to the manuscript service lookup.', 'color: red;');

    if (!this.lookupUrl || !doi) {
      return;
    }

    const url = `${this.lookupUrl}?doi=${doi}`;

    return fetch(url, { method: 'GET' })
      .then((resp) => {
        if (resp.status !== 200) {
          console.log(`%cFailed to lookup files for DOI (${doi}). Reason: "${resp.message}"`, 'color: red;');
          return {};
        }
        return resp.json();
      })
      .then((data) => data.manuscripts)
      .catch((e) => console.log(e));
  }
}
