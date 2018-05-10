import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  autocomplete: service('autocomplete'),

  actions: {
    searchGrants(term) {
      return this.get('autocomplete').suggest(['awardNumber', 'projectName'], term);
    },

    onSelect(selected) {
      this.get('store').findRecord('grant', selected.id).then(grant => this.sendAction('addGrant', grant));
    }
  },
});
