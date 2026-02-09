import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class NotFoundErrorRoute extends CheckSessionRoute {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('app-static-config') declare staticConfig: any;

  model() {
    return RSVP.hash({
      config: this.staticConfig.config,
    });
  }
}
