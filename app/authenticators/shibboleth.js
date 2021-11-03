/* eslint-disable no-debugger */
import Base from 'ember-simple-auth/authenticators/base';
import classic from 'ember-classic-decorator';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';

@classic
export default class Shibboleth extends Base {
  /**
   * @method authenticate
   * @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
   * @public
   */
  async authenticate() {
    return { access_token: 'shibboleth' };
  }

  /**
   Restores the session from a session data object; __will return a resolving
   promise when there is a non-empty `access_token` in the session data__ and
   a rejecting promise otherwise.
   @method restore
   @param {Object} data The data to restore the session from
   @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
   @public
   */
  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!this._validateData(data)) {
        return reject('Could not restore session - "access_token" missing.');
      }

      return resolve(data);
    });
  }

  /**
   This method simply returns a resolving promise.
   @method invalidate
   @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
   @public
   */
  invalidate() {
    return new RSVP.Promise((resolve /* , reject */) => {
      resolve();
    });
  }

  _validateData(data) {
    // see https://tools.ietf.org/html/rfc6749#section-4.2.2

    return !isEmpty(data) && !isEmpty(data.access_token);
  }
}
