import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import _ from 'lodash';

export default Route.extend({
  currentUser: Ember.inject.service('current-user'),

  model() {
    const user = this.get('currentUser.user');

    if (user.get('isAdmin')) {
    // if (true) { // Temp to manually try the 'admin' route
      return this._doAdmin();
    } else if (user.get('isSubmitter')) {
      return this._doSubmitter(user);
    }
  },

  _doAdmin() {
    return this.store.query('submission', { query: { match_all: {} }, size: 50 });
  },

  _doSubmitter(user) {
    return this.store.query('submission', { match: { user: user.get('id') } });
  },
});
