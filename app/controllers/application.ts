/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import config from '../config/environment';
import ENV from 'pass-ui/config/environment';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

export default class ApplicationController extends Controller {
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;

  rootURL: string | undefined = config.rootURL;

  @tracked wideRoutes: string[] = ['grants.index', 'grants.detail', 'submissions.index'];
  @tracked brand = get(this, 'staticConfig.branding');
  @tracked currentRouteName: string = this.router.currentRouteName;

  declare showNoticeBanner: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.showNoticeBanner = true;
  }

  get fullWidth(): boolean {
    return this.wideRoutes.includes(this.currentRouteName);
  }

  get logoUri(): string {
    return this.staticConfig?._config?.branding?.logo ?? '';
  }

  get homepage(): string {
    return this.staticConfig?._config?.branding?.homepage ?? '';
  }

  get contactUrl(): string {
    return this.staticConfig?._config?.branding?.contactUrl ?? '';
  }
}
