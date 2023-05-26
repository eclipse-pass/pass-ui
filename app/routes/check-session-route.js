/* eslint-disable ember/no-jquery */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import ENV from 'pass-ui/config/environment';

export default class CheckSessionRouteRoute extends Route {
  @service session;
  @service currentUser;

  @service('error-handler')
  errorHandler;

  async beforeModel() {
    // TODO: it is not ideal to have env checks in app code so it would be
    // great to find another way to authenticate users in the development env
    // with mirage at play. Note, we could direct people to go to the auth-callback
    // route which would achieve a similar effect.
    if (ENV.environment === 'development' && ENV['ember-cli-mirage']) {
      await this.session.authenticate('authenticator:http-only');
    }

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
