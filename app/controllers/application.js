/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import config from '../config/environment';
import ENV from 'pass-ui/config/environment';

export default class ApplicationController extends Controller {
  @service currentUser;
  @service router;
  @service('toast') notifications;

  @alias('model.staticConfig')
  staticConfig;

  params = ['userToken'];
  rootURL = config.rootURL;

  @tracked userToken = null;
  @tracked wideRoutes = ['grants.index', 'grants.detail', 'submissions.index'];
  @tracked brand = get(this, 'staticConfig.branding');
  @tracked currentRouteName = this.router.currentRouteName;

  constructor() {
    super(...arguments);

    if (ENV.environment === 'test') {
      this.showNoticeBanner = true;
    }
  }

  get fullWidth() {
    return this.wideRoutes.includes(this.currentRouteName);
  }

  get logoUri() {
    return get(this, 'brand.logo');
  }

  get homepage() {
    return get(this, 'brand.homepage');
  }
}
