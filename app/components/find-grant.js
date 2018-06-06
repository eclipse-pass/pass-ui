import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  currentUser: Ember.inject.service('current-user'),

  onSelect: () => {},

  actions: {
    searchGrants(term) {
      const regex = new RegExp(term, 'i');
      let userid = this.get('currentUser.user').get('id');
      return this.get('store').query('grant', { query: { term: { pi: userid } }, from: 0, size: 10 })
        .then(grants => grants.filter(grant => grant.get('awardNumber').match(regex) ||
                        grant.get('projectName').match(regex)));
    },
  },
});
