import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

/**
 * Service which returns information about the logged in user.
 */
export default Service.extend({
  whoamiUrl: ENV.userService.url,
  store: Ember.inject.service(),
  ajax: Ember.inject.service(),

  user: null,

  /**
   * load - Retrieve the logged in User from the whoami service and also set the
   * user property.
   *
   * @param  {type} userToken  Optionally specify token representing user to retrieve.
   * @returns {Promise}        Promise which resolves to the User.
   */
  load(userToken = null) {
    let params = userToken ? `?userToken=${encodeURIComponent(userToken)}` : null;
    let url = `${this.get('whoamiUrl')}${params || ''}`;

    return this.get('ajax').request(url, 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8',
        withCredentials: 'include'
      }
    }).then(response => this.get('store').findRecord('user', response['@id']).then((user) => {
      this.set('user', user);
      return user;
    }));
  }
});
