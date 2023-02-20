/* eslint-disable no-debugger */
import BaseSessionService from 'ember-simple-auth/services/session';

export default class SessionService extends BaseSessionService {
  /**
    This is an override of ember-simple-auth's handleInvalidation method
    that will redirect to an external url set by environment variable. This
    method is a noop if no url is provided.
    @method handleInvalidation
    @public
  */
  handleInvalidation() {
    window.location.replace(`${window.location.origin}/logout`);
  }

  handleAuthentication() {
    super.handleAuthentication('dashboard');
  }
}
