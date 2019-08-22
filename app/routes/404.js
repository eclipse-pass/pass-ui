import CheckSessionRoute from './check-session-route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default CheckSessionRoute.extend({
  staticConfig: service('app-static-config'),

  model() {
    return RSVP.hash({
      config: this.get('staticConfig').getStaticConfig()
    });
  }
});
