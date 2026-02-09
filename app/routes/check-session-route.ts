import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import type { AppError } from 'pass-ui/services/error-handler';

export default class CheckSessionRouteRoute extends Route {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare currentUser: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('error-handler') declare errorHandler: any;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async error(error: any, transition: any) {
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
