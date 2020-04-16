import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import config from '../config/environment';

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
  @tracked assetsUri = get(this, 'staticConfig.assetsUri');
  @tracked brand = get(this, 'staticConfig.branding');
  @tracked currentRouteName = this.router.currentRouteName;

  get fullWidth() {
    return this.wideRoutes.includes(this.currentRouteName);
  }

  get logoUri() {
    return this._staticUrl(get(this, 'brand.logo'));
  }

  get homepage() {
    return this.get('brand.homepage');
  }

  init() {
    super.init(...arguments);
  }

  _staticUrl(relativeUrl) {
    return `${this.assetsUri}${relativeUrl}`;
  }
}
