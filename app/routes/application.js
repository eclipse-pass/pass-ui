import CheckSessionRoute from './check-session-route';
import RSVP from 'rsvp';

const {
  service
} = Ember.inject;

export default CheckSessionRoute.extend({
  currentUser: service(),

  /* Used as route-action in templates */
  actions: {
    back() {
      history.back();
    },
    transitionTo(route, model) {
      this.transitionTo(route, model);
    },
  },

  afterModel() {
    return this._loadCurrentUser();
  },

  _loadCurrentUser() {
    return this.get('currentUser').load();
  }
});
