import Controller from '@ember/controller';
import config from '../config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service('current-user'),
  notifications: service('toast'),

  params: ['userToken'],
  userToken: null,
  rootURL: config.rootURL,
  // assetsUri: PassEmber.staticConfig.assetsUri,
  // brand: PassEmber.staticConfig.brand,
  wideRoutes: ['grants.index', 'grants.detail', 'submissions.index'],
  fullWidth: Ember.computed('currentRouteName', function () {
    return this.get('wideRoutes').includes(this.get('currentRouteName'));
  }),

  init() {
    this._super(...arguments);
  }
});
