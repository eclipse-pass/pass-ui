import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

export default class NotFoundErrorRoute extends CheckSessionRoute {
  @service('app-static-config') declare staticConfig: AppStaticConfigService;

  model() {
    return RSVP.hash({
      config: this.staticConfig.config,
    });
  }
}
