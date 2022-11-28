/* eslint-disable ember/no-computed-properties-in-native-classes */
import Base from 'ember-simple-auth/authenticators/base';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class HttpOnly extends Base {
  @service session;

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
        return reject('Could not restore session.');
      }

      return resolve(data);
    });
  }

  /**
   * @method authenticate
   * @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
   * @public
   */
  async authenticate() {
    const url = `${window.location.origin}/authenticated`;

    let response = await fetch(url);

    if (response.ok) {
      return response.json();
    } else {
      let error = await response.text();
      throw new Error(error);
    }
  }

  /**
   This method simply returns a resolving promise.
   @method invalidate
   @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
   @public
   */
  invalidate() {
    return new RSVP.Promise((resolve /*, reject*/) => {
      resolve();
    });
  }

  async _validateData(data) {
    // see https://tools.ietf.org/html/rfc6749#section-4.2.2
    if (isEmpty(data) || isEmpty(data.user.id)) return false;

    const url = `${window.location.origin}/authenticated`;

    let response = await fetch(url);

    if (response.ok) {
      const refreshedData = await response.json();

      return data.user.id === refreshedData.user.id;
    } else {
      return false;
    }
  }
}
