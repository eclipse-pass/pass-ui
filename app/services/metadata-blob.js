import Service from '@ember/service';
import _ from 'lodash';

export default Service.extend({
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
