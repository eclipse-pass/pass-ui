import Controller from '@ember/controller';
import config from '../config/environment';

export default Controller.extend({
  // session: Ember.inject.service('session'),
  rootURL: config.rootURL,
  currentUser: Ember.inject.service('current-user'),
  notifications: Ember.inject.service('toast'),
  institution: '',
  wideRoutes: ['grants.index', 'grants.detail', 'submissions.index'],
  fullWidth: Ember.computed('currentRouteName', function () {
    return this.get('wideRoutes').includes(this.get('currentRouteName'));
  }),
  didRender() {
    this.set('institution', this.store.find('institution'));
  },
  actions: {
    invalidateSession() {
      // this.get('session').invalidate();
    },
  },
});
