import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service('current-user'),
  store: service('store'),
  autocomplete: service('autocomplete'),

  actions: {
    searchGrants(term) {
      const user = this.get('currentUser.user');
      return this.get('autocomplete').suggest(['awardNumber', 'projectName'], term, { pi: user.id }, 'grant');
    },

    onSelect(selected) {
      this.get('store').findRecord('grant', selected.id).then(grant => this.sendAction('addGrant', grant));
    }
  },
});
