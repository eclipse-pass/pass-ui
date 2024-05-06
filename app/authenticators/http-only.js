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
  async restore(data) {
    const normalizedData = this.normalizeSessionData(data);
    const dataIsValid = await this._validateData(normalizedData);

    return new RSVP.Promise((resolve, reject) => {
      if (dataIsValid) {
        return resolve(normalizedData);
      } else {
        return reject('Could not restore session.');
      }
    });
  }

  /**
   * Normalizes session data so that we maintain a consistent shape.
   * @param {*} data
   * @returns data
   */
  normalizeSessionData(data) {
    if (!data?.id && data?.user?.id) {
      return {
        id: data.user.id,
        ...data,
      };
    }
    return data;
  }

  /**
   * @method authenticate
   * @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
   * @public
   */
  async authenticate() {
    const url = `/user/whoami`;

    let response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      const normalizedData = this.normalizeSessionData(data);

      return new RSVP.Promise((resolve, _reject) => {
        return resolve(normalizedData);
      });
    } else {
      let error = await response.text();
      throw new Error(error);
    }
  }

  async _validateData(data) {
    // see https://tools.ietf.org/html/rfc6749#section-4.2.2
    if (isEmpty(data) || isEmpty(data.id)) return false;

    const url = `/user/whoami`;

    let response = await fetch(url);

    if (response.ok) {
      const refreshedData = this.normalizeSessionData(await response.json());

      return data.id === refreshedData.id;
    } else {
      return false;
    }
  }
}
