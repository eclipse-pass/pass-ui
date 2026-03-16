import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import type CurrentUserService from 'pass-ui/services/current-user';
import type ErrorHandlerService from 'pass-ui/services/error-handler';
import type { AppError } from 'pass-ui/services/error-handler';
import type SessionService from 'ember-simple-auth/services/session';

interface ErrorWithStatus {
  errors?: Array<{ status?: number | string }>;
  message?: string;
}

export default class CheckSessionRouteRoute extends Route {
  @service declare session: SessionService;
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
  async error(error: unknown, transition: unknown): Promise<void> {
    console.error(error);
    const errorObject = (error as ErrorWithStatus)?.errors?.[0] || {};

    if ([401, 403].includes(Number(errorObject.status))) {
      this.session.set('attemptedTransition', transition);
      await this.session.invalidate();
    } else {
      this.errorHandler.handleError(error as AppError);
    }
  }
}
