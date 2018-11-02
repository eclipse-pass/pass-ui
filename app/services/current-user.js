import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  whoamiUrl: ENV.userService.url,
  store: Ember.inject.service(),
  ajax: Ember.inject.service(),

  user: null,

  load(userToken = null) {
    let params = userToken ? `?userToken=${userToken}` : null;
    let url = `${this.get('whoamiUrl')}${params || ''}`;
    this.set('whoamiUrl', url);
    console.log(`getting url: ${url}`);
    return this.get('ajax').request(this.get('whoamiUrl', 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8',
        withCredentials: 'include'
      }
    })).then((response) => { // eslint-disable-line
      return this.get('store').findRecord('user', response['@id']).then((user) => {
        this.set('user', user);
        return user;
      });
    });
  },
});
