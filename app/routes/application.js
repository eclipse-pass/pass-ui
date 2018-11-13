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

  /**
   * It is possible for unfortunate things to happen somewhere in the backend stack
   * that will result in route ids not being encoded.
   * Therefore we specially handle the /submissions/id and /grants/id routes. In
   * the event that unencoded ID is encountered (it will include slashes), replace
   * the current history with the encoded version.
   */
  beforeModel(transition) {
    const intent = transition.intent.url;

    if (!intent) {
      return;
    }

    let prefix = null;

    if (intent.startsWith('/grants/')) {
      prefix = '/grants/';
    } else if (intent.startsWith('/submissions/')) {
      prefix = '/submissions/';
    } else {
      return;
    }

    // Ensure that route parameter is encoded
    if (intent.includes('https://')) {
      let q = intent.indexOf('?');
      if (q == -1) {
        q = intent.length;
      }
      const targetId = intent.substring(prefix.length, q);
      this.replaceWith(`${prefix}${encodeURIComponent(targetId)}`);
    }
  },

  afterModel(model, transition) {
    return this._loadCurrentUser(transition.queryParams.userToken);
  },

  _loadCurrentUser(userToken) {
    console.log(`userToken: ${userToken}`);
    return this.get('currentUser').load(userToken);
  }
});
