import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

/**
 * Some links in the navbar point to static pages hosted outside of Ember. Those
 * URLs are relative to 'assetsUri' which is known from the static configuration
 */
export default Component.extend({
  currentUser: service('current-user'),
  configurator: service('app-static-config'),

  assetsUri: null,

  /**
   * Do we have a valid user loaded into the user service?
   */
  hasAUser: computed('currentUser.user', function () {
    return !!this.get('currentUser.user');
  }),

  init() {
    this._super(...arguments);

    this.get('configurator').getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  },

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
