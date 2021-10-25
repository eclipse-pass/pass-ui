/* eslint-disable no-debugger */
import BaseSessionService from 'ember-simple-auth/services/session';
import ENV from 'pass-ember/config/environment';
import classic from 'ember-classic-decorator';

@classic
export default class SessionService extends BaseSessionService {
  /**
    This is an override of ember-simple-auth's handleInvalidation method
    that will redirect to an external url set by environment variable. This
    method is a noop if no url is provided.
    @method handleInvalidation
    @public
  */
  handleInvalidation() {
    // TODO: figure out if we need to test and guard against an actual external redirect
    window.location.replace(ENV.postSessionInvalidationUrl || 'http://pass.local/');
  }
}
