import Controller from '@ember/controller';
import config from '../config/environment';

export default Controller.extend({
  session: Ember.inject.service('session'),
  rootURL: config.rootURL,
  currentUser: Ember.inject.service('current-user'),
  institution: '',
  didRender() {
    this.set('institution', this.store.find('institution'));
  },
  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    },
  },
});
