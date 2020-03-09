import { computed } from '@ember/object';
import Controller from '@ember/controller';
import config from '../config/environment';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  currentUser: service('current-user'),
  notifications: service('toast'),

  staticConfig: alias('model.staticConfig'),

  params: ['userToken'],
  userToken: null,
  rootURL: config.rootURL,

  wideRoutes: ['grants.index', 'grants.detail', 'submissions.index'],
  fullWidth: computed('currentRouteName', function () {
    return this.get('wideRoutes').includes(this.get('currentRouteName'));
  }),

  assetsUri: computed('staticConfig', function () {
    return this.get('staticConfig.assetsUri');
  }),

  brand: computed('staticConfig', function () {
    return this.get('staticConfig.branding');
  }),

  logoUri: computed('brand', function () {
    return this._staticUrl(this.get('brand.logo'));
  }),

  homepage: computed('brand', function () {
    return this.get('brand.homepage');
  }),

  init() {
    this._super(...arguments);
  },

  _staticUrl(relativeUrl) {
    return `${this.get('assetsUri')}${relativeUrl}`;
  }
});
