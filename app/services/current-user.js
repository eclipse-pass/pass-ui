/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
/* eslint-disable no-debugger */
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
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
   * load - Retrieve the logged in User and also sets the
   * user property.
   *
   * @returns {Promise}        Promise which resolves to the User.
   */
  @task
  load = function* () {
    let userId = this.session.data.authenticated.user_id;

    if (userId) {
      let user = yield this.store.findRecord('user', userId);
      this.user = user;
    }

    return user;
  };
}
