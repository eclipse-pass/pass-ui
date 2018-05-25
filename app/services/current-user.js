import Ember from 'ember';
import fetch from 'fetch';
import Service from '@ember/service';

const { inject: { service }, RSVP } = Ember;

export default Service.extend({
  whoamiUrl: 'http://pass/pass-user-service/whoami',
  store: service(),
  // ajax: service(),
  user: null,

  load() {
    return fetch(this.get('whoamiUrl', {
      credentials: 'include'
    })).then((data) => {debugger});
  },
});
