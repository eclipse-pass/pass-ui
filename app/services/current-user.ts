/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
/* eslint-disable no-debugger */
import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type UserModel from 'pass-ui/models/user';

/**
 * Service which returns information about the logged in user.
 */

export default class CurrentUserService extends Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;

  user: UserModel | null = null;

  /**
   * load - Retrieve the logged in User and also sets the
   * user property.
   *
   * @returns {Promise}        Promise which resolves to the User.
   */
  @task
  load = function* () {
    const userId = this.session.data.authenticated.id;

    if (userId) {
      const user = yield this.store.findRecord('user', userId);
      this.user = user;
    }

    return this.user;
  };
}
