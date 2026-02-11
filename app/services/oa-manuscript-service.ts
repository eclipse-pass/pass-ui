import Service from '@ember/service';
import ENV from 'pass-ui/config/environment';

export interface ManuscriptInfo {
  url: string;
  name: string;
  type: string;
  source: string;
  repositoryLabel: string;
}

export default class OAManuscriptService extends Service {
  lookUpPath: string = ENV.doiService.manuscriptLookUpPath;

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
  lookup(doi: string): ManuscriptInfo[] | Promise<ManuscriptInfo[] | void> {
    console.assert(!!this.lookUpPath, '%cOA Manuscript service lookup for DOIs not found.', 'color: red;');
    console.assert(!!doi, '%cNo DOI was provided to the manuscript service lookup.', 'color: red;');

    if (!this.lookUpPath || !doi) {
      return [];
    }

    const url = `${this.lookUpPath}?doi=${doi}`;

    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=utf-8',
        'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)!['1']!,
      },
    })
      .then((resp) => {
        if (resp.status !== 200) {
          console.log(`%cFailed to lookup files for DOI (${doi}). Reason: "${resp.statusText}"`, 'color: red;');
          return [];
        }
        return resp.json();
      })
      .then((data) => data.manuscripts)
      .catch((e) => console.log(e));
  }
}
