import Ember from 'ember';
import fetch from 'fetch';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

const { inject: { service }, RSVP } = Ember;

export default Service.extend({
  whoamiUrl: ENV.userService.url,
  store: service(),
  // ajax: service(),
  user: null,

  load() {
    return fetch(this.get('whoamiUrl', {
      credentials: 'include'
    })).then((data) => {debugger});
  },
});
