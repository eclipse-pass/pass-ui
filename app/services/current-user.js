/* eslint-disable no-debugger */
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';
import { task } from 'ember-concurrency-decorators';
import { get } from '@ember/object';

/**
 * Service which returns information about the logged in user.
 */

export default class CurrentUserService extends Service {
  whoamiUrl = ENV.userService.url;

  @service store;
  @service ajax;
  @service session;

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
    try {
      let params = userToken ? `?userToken=${encodeURIComponent(userToken)}` : null;
      let url = `${get(this, 'whoamiUrl')}${params || ''}`;
      const response = yield fetch(url);

      if ([401, 403].includes(response.status)) {
        this.session.invalidate();
      }

      const data = yield response.json();

      let user = yield get(this, 'store').findRecord('user', data['@id']);

      this.set('user', user);

      return user;
    } catch (error) {
      this.session.invalidate();
    }
  }
}
