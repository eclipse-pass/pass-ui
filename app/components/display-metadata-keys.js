import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({

  metadata: Ember.computed('submission', function () {
    return this.get('submission.metadata');
  }),

  // TODO: could be changed to get the real label from relevant metadata schema!
  displayData: Ember.computed('metadata', function () {
    const metadata = this.get('metadata');
    const result = [];

    // Basically recreate the madness from 'metadata-blob#getDisplayBlob'
    Object.keys(metadata).forEach((key) => {
      let value = metadata[key];
      const isArray = Array.isArray(value);

      if (!value || (isArray && value.length === 0)) {
        return;
      } else if (isArray && value.hasOwnProperty('toArray')) {
        value = value.toArray();
      }
      result.push({
        label: this.hackTheKey(key),
        value,
        isArray
      });
    });

    return result;
  }),

  // Hack to turn the former keys into display friendly 'labels'
  hackTheKey(key) {
    if (key === 'nlmta') {
      return 'NLMTA';
    } else if (key === 'doi') {
      return 'DOI';
    } else if (key === 'issn') {
      return 'ISSN';
    }

    return _.capitalize(key.replace('-', ' '));
  }

});
