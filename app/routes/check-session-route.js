/* eslint-disable ember/no-jquery */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CheckSessionRouteRoute extends Route {
  @service toast;
  @service session;
  @service currentUser;

  @service('error-handler')
  errorHandler;

  async beforeModel() {
    if (!this.currentUser.user) {
      await this._loadCurrentUser();
    }

    if (!this.session.isAuthenticated) {
      this.session.set('attemptedTransition', transition);
      await this.session.invalidate();
    }
  }

  _loadCurrentUser() {
    return this.currentUser.load.perform();
  }

  @action
  async error(error, transition) {
    const errorObject = error?.errors?.firstObject || {};

    if ([401, 403].includes(Number(errorObject.status))) {
      this.session.set('attemptedTransition', transition);
      await this.session.invalidate();
    }
  }
}
