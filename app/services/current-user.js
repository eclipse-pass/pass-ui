import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';
import { task } from 'ember-concurrency-decorators';

/**
 * Service which returns information about the logged in user.
 */

export default class CurrentUserService extends Service {
  whoamiUrl = ENV.userService.url;

  @service store;
  @service ajax;

  user = null;

  /**
   * load - Retrieve the logged in User from the whoami service and also set the
   * user property.
   *
   * @param  {type} userToken  Optionally specify token representing user to retrieve.
   * @returns {Promise}        Promise which resolves to the User.
   */
  @task
  load = function* (userToken = null) {
    let params = userToken ? `?userToken=${encodeURIComponent(userToken)}` : null;
    let url = `${this.get('whoamiUrl')}${params || ''}`;
    let response = yield this.get('ajax').request(url, 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8',
        withCredentials: 'include'
      }
    });

    let user = yield this.get('store').findRecord('user', response['@id']);

    this.set('user', user);

    return user;
  }
}
