import Ember from 'ember';
import Service from '@ember/service';
const { inject: { service }, RSVP } = Ember;

export default Service.extend({
  session: service(),
  store: service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('store').queryRecord('user', { me: true, include: 'person' }).then((user) => {
        this.set('user', user);
      });
    } else {
      return RSVP.resolve();
    }
  }
});
