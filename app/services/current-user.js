import Ember from 'ember';
import Service from '@ember/service';
const { inject: { service }, RSVP } = Ember;

export default Service.extend({
  session: service('session'),
  store: service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('store').queryRecord('user', { me: true, include: 'person' }).then((user) => {
        this.set('user', user);
      });
    } else {
      return RSVP.resolve();
    }
  },
  person: Ember.computed('user', function(){
    return this.get('store').queryRecord('person', this.get('user.person')).then((person) => {
      debugger;
      this.set('person', person);
    });
  })
});
