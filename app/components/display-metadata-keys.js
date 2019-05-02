import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  // Metadata keys to ignore (not display)
  ignoreList: ['agent_information', 'external-submissions'],

  metadata: Ember.computed('submission', function () {
    return JSON.parse(this.get('submission.metadata'));
  }),

  // TODO: could be changed to get the real label from relevant metadata schema!
  displayData: Ember.computed('metadata', function () {
    const ignoreList = this.get('ignoreList');
    const metadata = this.get('metadata');
    const result = [];

    // Basically recreate the madness from 'metadata-blob#getDisplayBlob'
    Object.keys(metadata).filter(key => !ignoreList.includes(key)).forEach((key) => {
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
