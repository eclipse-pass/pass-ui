import Service from '@ember/service';

export default Service.extend({
  base: 'http://doi.org/',

  /** Resolve the DOI of a submission to return a promise for a CSL JSON object.
     *
     * See: https://github.com/citation-style-language/schema#csl-json-schema
     *
     * @param submission DS.model app/models/submission.js
     * @returns Promise<object>
     */
  resolve(submission) {
    const doi = submission.get('doi');
    if (!doi) {
      return Promise.reject(new Error('No DOI present'));
    }

    return fetch(this.get('base') + encodeURI(doi), {
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
  },
});
