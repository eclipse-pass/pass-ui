import Service from '@ember/service';
import _ from 'lodash';

/**
 * Service for manipulating a submission metadata blob.
 */
export default Service.extend({

  /**
   * Merge data from metadata blob2 into metadata blob1 and output the result as a new
   * object (this operation will not mutate either input objects). Broken out here in
   * case special logic needs to be assigned.
   *
   * Impl note: each blob now has a default value set of an empty object because
   * Object.assign will die if any arguments is undefined
   *
   * @param {object} blob1 arbitrary JSON object representing metadata for a submission
   * @param {object} blob2 arbitrary JSON object representing metadata for a submission
   */
  mergeBlobs(blob1 = {}, blob2 = {}) {
    let blob = Object.assign(blob1, blob2);
    Object.keys(blob).filter(key => !blob[key]).forEach(key => delete blob[key]);
    return blob;
  },

  /**
   * Get a metadata blob containing information about external repositories. The resulting
   * object can be merged into the larger metadata blob with #mergeBlobs.
   *
   * result['external-submissions'] array will always be defined.
   *
   * @param {object} repositories list of Repository model objects
   * @returns {
   *    'external-repositories': [
   *      {
   *        message: '',  // Message to show to the user about this repo
   *        name: '', // Name of this external repository
   *        url: '' // URL of this external repository
   *      }
   *    ]
   * }
   */
  getExternalReposBlob(repositories) {
    const result = [];
    const externalRepos = repositories.filter(repo => repo.get('integrationType') === 'web-link');
    externalRepos.forEach(repo => result.push({
      message: `Deposit into ${repo.get('name')} was prompted`,
      name: repo.get('name'),
      url: repo.get('url')
    }));
    return {
      'external-submissions': result
    };
  },

  /**
   * Transform a given metadata object into another object with keys/values suitable for dislplay
   * to a user in the UI.
   *
   * @param {object} metadataBlob arbitrary JSON object representing the metadata for a submission
   */
  getDisplayBlob(metadataBlob) {
    let metadataBlobNoKeys = [];
    JSON.parse(metadataBlob).forEach((ele) => {
      for (var key in ele.data) {
        if (ele.data.hasOwnProperty(key)) {
          let strippedData;
          strippedData = ele.data[key];

          if (key === 'authors') {
            if (Array.isArray(strippedData) && strippedData.length > 0) {
              if (metadataBlobNoKeys['author(s)']) {
                metadataBlobNoKeys['author(s)'] = _.uniqBy(metadataBlobNoKeys['author(s)'], 'author');
              } else {
                metadataBlobNoKeys['author(s)'] = strippedData;
              }
            }
          } else if (key === 'container-title') {
            metadataBlobNoKeys['journal-title'] = strippedData;
          } else if (key === 'issn-map') {
            // Do nothing
          } else {
            metadataBlobNoKeys[key] = strippedData;
          }
        }
      }
    });
    // capitalize all keys in metadata blob and remove the old lowercased one
    for (var key in metadataBlobNoKeys) {
      if (metadataBlobNoKeys.hasOwnProperty(key)) {
        // three use cases for upper case
        if (key === 'nlmta' || key === 'doi' || key === 'ISSN') {
          metadataBlobNoKeys[_.upperCase(key)] = metadataBlobNoKeys[key];
        } else {
          metadataBlobNoKeys[_.capitalize(key)] = metadataBlobNoKeys[key];
        }
        if (key !== 'ISSN') {
          delete metadataBlobNoKeys[key];
        }
      }
    }
    return metadataBlobNoKeys;
  }
});

