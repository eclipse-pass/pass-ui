import Component from '@ember/component';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),

  /**
   * Do we have a valid user loaded into the user service?
   */
  hasAUser: Ember.computed('currentUser.user', function () {
    return !!this.get('currentUser.user');
  }),

  actions: {
    invalidateSession() {
      // this.get('session').invalidate();
    },
  },
});
