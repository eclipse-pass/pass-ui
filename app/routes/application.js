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

  afterModel(model, transition) {
    return this._loadCurrentUser(transition.queryParams.userToken);
  },

  _loadCurrentUser(userToken) {
    console.log(`userToken: ${userToken}`);
    return this.get('currentUser').load(userToken);
  }
});
