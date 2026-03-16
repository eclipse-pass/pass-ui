import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import config from '../config/environment';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

export default class ApplicationController extends Controller {
  @service declare currentUser: CurrentUserService;
  @service declare router: RouterService;
  @service declare flashMessages: FlashMessageService;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;

  rootURL: string | undefined = config.rootURL;

  @tracked wideRoutes: string[] = ['grants.index', 'grants.detail', 'submissions.index'];
  // @ts-expect-error TS2729 - @service creates a prototype getter, available during field init
  @tracked brand = this.staticConfig?.branding;
  // @ts-expect-error TS2729 - @service creates a prototype getter, available during field init
  @tracked currentRouteName: string = this.router.currentRouteName;

  declare institution: string;
  declare assetsUri: string;
  declare showNoticeBanner: boolean;

  constructor(owner: Owner) {
    super(owner);

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
