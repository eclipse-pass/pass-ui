/* eslint-disable no-debugger */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action, get } from '@ember/object';

export default class CheckSessionRouteRoute extends Route {
  @service toast;
  @service session;
  @service currentUser;

  @service('error-handler')
  errorHandler;

  async beforeModel() {
    await this._loadCurrentUser(null);

    // TODO: this should be moved to a callback route in the ember app
    // that shibboleth routes to when an auth is successful. For now,
    // we just assume that if execution made it out of the check session
    // route without an error that auth is valid and simple auth should
    // authenticate as well.
    if (!this.session.isAuthenticated) {
      await this.session.authenticate('authenticator:shibboleth');
    }
  }

  _loadCurrentUser(userToken) {
    return get(this, 'currentUser.load').perform(userToken);
  }

  @action
  async error(error, transition) {
    const errorObject = error?.errors?.firstObject || {};

    if ([401, 403].includes(Number(errorObject.status))) {
      this.session.set('attemptedTransition', transition);
      this.session.invalidate();
    }

    // TODO: eventually this shouldn't be fired on every error but only on those
    // that represent a rejected authentication like the 400 errors that are handled
    // above.
    this.session.invalidate();
  }
}
