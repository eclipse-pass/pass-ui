import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';
import { task } from 'ember-concurrency-decorators';

export default class OAManuscriptService extends Service {
  lookupUrl = ENV.oaManuscriptService.lookupUrl;
  downloadUrl = ENV.oaManuscriptService.downloadUrl;

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

    // console.log(`%cdownloader service: ${url}`, 'color: blue;');
    // return Promise.resolve({
    //   url: 'https://dash.harvard.edu/bitstream/1/12285462/1/Nanometer-Scale%20Thermometry.pdf',
    //   name: 'Nanometer-Scale Thermometry.pdf',
    //   type: 'application/pdf',
    //   source: 'Unpaywall',
    //   repositoryLabel: 'Harvard University - Digital Access to Scholarship at Harvard (DASH)'
    // });

    return fetch(url, { method: 'GET' })
      .then((resp) => {
        if (resp.status !== 200) {
          console.log(`%cFailed to lookup files for DOI (${doi}). Reason: "${resp.message}"`, 'color: red;');
          return {};
        }
        return resp.json();
      })
      .then(data => data.manuscripts)
      .catch(e => console.log(e));
  }

  /**
   * Request that the service download the file found at the provided URL and
   * return the Fedora URI where the downloaded bits can be found.
   *
   * @param {array} urls list of URLs of the files to get
   * @param {string} doi the DOI that these files are associated with
   * @returns {string} Fedora URL where the file bits can be found
   */
  @task
  * downloadManuscript(url, doi) {
    console.assert(!!this.downloadUrl, '%cOA Manuscript service download URL not found.', 'color: red;');
    console.assert(!!url, '%cfile url not provided', 'color: red;');
    console.assert(!!doi, '%cNo DOI provided to the OA manuscript downloader', 'color: red;');

    if (!this.downloadUrl || !url || !doi) {
      return;
    }

    // TODO: just grab the first string for now :(
    const serviceUrl = `${this.downloadUrl}?doi=${doi}&url=${url}`;

    // console.log(`%cOA Manuscripts Download service ${url}`, 'color: blue;');
    // return 'https://dash.harvard.edu/bitstream/1/12285462/1/Nanometer-Scale%20Thermometry.pdf';

    const response = yield fetch(serviceUrl, { method: 'POST' });
    const text = yield response.text();

    if (!response.ok) {
      throw new Error(text);
    }

    return text;
  }
}
