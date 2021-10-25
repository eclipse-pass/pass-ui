/* eslint-disable ember/no-jquery */
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

    if (!this.session.isAuthenticated) {
      this.session.set('attemptedTransition', transition);
      await this.session.invalidate();
    }
  }

  _loadCurrentUser(userToken) {
    return this.currentUser.load.perform(userToken);
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
