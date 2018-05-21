import Ember from 'ember';
import Service from '@ember/service';

const { inject: { service }, RSVP } = Ember;

export default Service.extend({
  session: service(),
  store: service(),
  user: null,

  load() {
    if (this.get('session.isAuthenticated')) {
      // TODO hit the UserService here
      return this.get('store').findAll('user').then((users) => {
        this.set('user', users.findBy('username', 'hvu'));
      });
    }
    return RSVP.resolve();
  },
});
