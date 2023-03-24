/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
/* eslint-disable no-debugger */
import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * Service which returns information about the logged in user.
 */

export default class CurrentUserService extends Service {
  @service store;
  @service session;

  user = null;

  /**
   * load - Retrieve the logged in User and also sets the
   * user property.
   *
   * @returns {Promise}        Promise which resolves to the User.
   */
  load = task(async () => {
    let userId = this.session.data.authenticated.user.id;

    if (userId) {
      let user = await this.store.findRecord('user', userId);
      this.user = user;
    }

    return this.user;
  });
}
