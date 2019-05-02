import CheckSessionRoute from '../../check-session-route';
import { inject as service } from '@ember/service';

export default CheckSessionRoute.extend({
  workflow: service('workflow'),
  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(3);
    }
  }
});
