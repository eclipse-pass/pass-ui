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
            if (metadataBlobNoKeys['author(s)']) {
              metadataBlobNoKeys['author(s)'] = _.uniqBy(metadataBlobNoKeys['author(s)'].concat(strippedData), 'author');
            } else {
              metadataBlobNoKeys['author(s)'] = strippedData;
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
    for (var key in metadataBlobNoKeys) {
      if (metadataBlobNoKeys.hasOwnProperty(key)) {
        metadataBlobNoKeys[_.capitalize(key)] = metadataBlobNoKeys[key];
        delete metadataBlobNoKeys[key];
      }
    }
    return metadataBlobNoKeys;
  }
});
