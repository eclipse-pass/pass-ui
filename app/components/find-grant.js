import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service('current-user'),
  store: service('store'),

  onSelect: () => {},

  actions: {
    searchGrants(term) {
      const regex = new RegExp(term, 'i');
      let userid = this.get('currentUser.user').get('id');
      return this.get('store').query('grant', { query: { term: { pi: userid } }, from: 0, size: 500 })
        .then(grants => grants.filter(grant => grant.get('awardNumber').match(regex) ||
                        grant.get('projectName').match(regex)));
    },

    onSelect(selected) {
      this.get('store').findRecord('grant', selected.id).then(grant => this.sendAction('addGrant', grant));
    }
  },
});
