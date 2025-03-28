import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CheckSessionRouteRoute extends Route {
  @service session;
  @service currentUser;

  @service('error-handler')
  errorHandler;

  async beforeModel() {
    if (!this.session.isAuthenticated) {
      await this.session.setup();

      await this.session.authenticate('authenticator:http-only');
    }

    if (!this.currentUser.user) {
      await this._loadCurrentUser();
    }
  }

  _loadCurrentUser() {
    return this.currentUser.load.perform();
  }

  @action
  async error(error, transition) {
    console.error(error);
    const errorObject = error?.errors[0] || {};

    if ([401, 403].includes(Number(errorObject.status))) {
      this.session.set('attemptedTransition', transition);
      await this.session.invalidate();
    } else {
      this.errorHandler.handleError(error);
    }
  }
}
