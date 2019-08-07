import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service('current-user'),

  assetsUri: PassEmber.assetsUri,

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
  didRender() {
    this._super(...arguments);
    if (window.location.search.indexOf('anchor=') == -1) {
      window.scrollTo(0, 0);
    }
  }
});
