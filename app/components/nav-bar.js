import Component from '@ember/component';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),

  actions: {
    invalidateSession() {
      // this.get('session').invalidate();
    },
  },
});
