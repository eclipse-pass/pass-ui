import CheckSessionRoute from '../../check-session-route';

const {
  service,
} = Ember.inject;

export default CheckSessionRoute.extend({
  workflow: service(),
  actions: {
    didTransition() {
      this.get('workflow').setCurrentStep(4);
    }
  }
});
