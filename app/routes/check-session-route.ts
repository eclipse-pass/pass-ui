import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import type { AppError } from 'pass-ui/services/error-handler';
import type CurrentUserService from 'pass-ui/services/current-user';
import type ErrorHandlerService from 'pass-ui/services/error-handler';

export default class CheckSessionRouteRoute extends Route {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;
  @service declare currentUser: CurrentUserService;

  @service('error-handler') declare errorHandler: ErrorHandlerService;

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
  // @ts-expect-error async error handler override with different return type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async error(error: any, transition: any): Promise<void> {
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
