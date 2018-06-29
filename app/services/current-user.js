import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  whoamiUrl: ENV.userService.url,
  store: Ember.inject.service(),
  ajax: Ember.inject.service(),

  user: null,

  load() {
    return this.get('ajax').request(this.get('whoamiUrl', 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8'
      },
      xhrFields: { withCredentials: 'include' }
    })).then((response) => { // eslint-disable-line
      return this.get('store').findRecord('user', response['@id']).then((user) => {
        this.set('user', user);
        return user;
      });
    });
  },
});
