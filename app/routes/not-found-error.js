import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class NotFoundErrorRoute extends CheckSessionRoute {
  @service('app-static-config') staticConfig;

  model() {
    return RSVP.hash({
      config: this.staticConfig.getStaticConfig()
    });
  }
}
