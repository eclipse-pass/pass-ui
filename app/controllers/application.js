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
  fullWidth: Ember.computed('currentRouteName', function () {
    return this.get('wideRoutes').includes(this.get('currentRouteName'));
  }),

  assetsUri: Ember.computed('staticConfig', function () {
    return this.get('staticConfig.assetsUri');
  }),

  brand: Ember.computed('staticConfig', function () {
    return this.get('staticConfig.branding');
  }),

  logoUri: Ember.computed('brand', function () {
    return this._staticUrl(this.get('brand.logo'));
  }),

  homepage: Ember.computed('brand', function () {
    return this.get('brand.homepage');
  }),

  init() {
    this._super(...arguments);
  },

  _staticUrl(relativeUrl) {
    return `${this.get('assetsUri')}${relativeUrl}`;
  }
});
