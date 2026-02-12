import Base from 'ember-simple-auth/authenticators/base';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class HttpOnly extends Base {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;

  /**
   Restores the session from a session data object; __will return a resolving
   promise when there is a non-empty `access_token` in the session data__ and
   a rejecting promise otherwise.
   @method restore
   @param {Object} data The data to restore the session from
   @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
   @public
   */
  async restore(data: Record<string, unknown>) {
    const normalizedData = this.normalizeSessionData(data);
    const dataIsValid = await this._validateData(normalizedData);

    return new Promise((resolve, reject) => {
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
  normalizeSessionData(data: Record<string, unknown>) {
    if (!data?.['id'] && (data?.['user'] as Record<string, unknown>)?.['id']) {
      return {
        id: (data['user'] as Record<string, unknown>)['id'],
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

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      const normalizedData = this.normalizeSessionData(data);

      return new Promise((resolve, _reject) => {
        return resolve(normalizedData);
      });
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  }

  async _validateData(data: Record<string, unknown>) {
    // see https://tools.ietf.org/html/rfc6749#section-4.2.2
    if (isEmpty(data) || isEmpty(data['id'])) return false;

    const url = `/user/whoami`;

    const response = await fetch(url);

    if (response.ok) {
      const refreshedData = this.normalizeSessionData(await response.json());

      return data['id'] === refreshedData['id'];
    } else {
      return false;
    }
  }
}
