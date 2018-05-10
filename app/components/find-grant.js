import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  autocomplete: service('autocomplete'),

  actions: {
    searchGrants(term) {
      // const regex = new RegExp(term, 'i');

      // return this.get('store').findAll('grant')
      //   .then(grants => grants.filter(grant => grant.get('awardNumber').match(regex) ||
      //                   grant.get('projectName').match(regex)));
      return this.get('autocomplete').suggest(['projectName', 'awardNumber'], term);
    },

    onSelect(selected) {
      debugger
      this.sendAction('onSelect', moo);
    }
  },
});
