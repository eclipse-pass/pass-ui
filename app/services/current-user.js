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
      return this.get('store').query('user', { match: { username: 'hvu' } }).then((users) => {
        if (users.content.length > 0) {
          this.set('user', users.get('firstObject'));
        }
      });
    }
    return RSVP.resolve();
  },
});
