import Service, { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { findRecord } from 'pass-ui/builders/pass-api';
import type UserModel from 'pass-ui/models/user';
import type AppStore from 'pass-ui/services/store';

/**
 * Service which returns information about the logged in user.
 */

export default class CurrentUserService extends Service {
  @service declare store: AppStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;

  user: UserModel | null = null;

  /**
   * load - Retrieve the logged in User and also sets the
   * user property.
   *
   * @returns {Promise}        Promise which resolves to the User.
   */
  load = task(async () => {
    const userId = this.session.data.authenticated.id;

    if (userId) {
      const { content } = await this.store.request(findRecord('user', userId));
      this.user = (content as { data: UserModel }).data;
    }

    return this.user;
  });
}
