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
  @service flashMessages;
  @service('app-static-config') staticConfig;

  rootURL = config.rootURL;

  @tracked wideRoutes = ['grants.index', 'grants.detail', 'submissions.index'];
  @tracked brand = get(this, 'staticConfig.branding');
  @tracked currentRouteName = this.router.currentRouteName;

  constructor() {
    super(...arguments);

    this.showNoticeBanner = true;
  }

  get fullWidth() {
    return this.wideRoutes.includes(this.currentRouteName);
  }

  get logoUri() {
    return this.staticConfig?._config?.branding?.logo ?? '';
  }

  get homepage() {
    return this.staticConfig?._config?.branding?.homepage ?? '';
  }

  get contactUrl() {
    return this.staticConfig?._config?.branding?.contactUrl ?? '';
  }
}
