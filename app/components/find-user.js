import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  autocomplete: service('autocomplete'),

  actions: {
    searchUsers(term) {
      return this.get('autocomplete').suggest('lastName', term);
    },

    onSelect(selected) {
      this.get('store').findRecord('user', selected.id).then(user => this.sendAction('selectUsers', user));
    }
  },
});
