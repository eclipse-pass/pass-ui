import CheckSessionRoute from './check-session-route';

export default CheckSessionRoute.extend({
  queryParams: {
    anchor: {
      refreshModel: true
    }
  },
  model(params) {
    var faqController = this.controllerFor('faq');
    faqController.set('anchorLocation', params.anchor);
  }
});
