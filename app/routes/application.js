import Route from '@ember/routing/route';

export default Route.extend({

  /* Used as route-action in templates*/
  actions: {
    back() {
      history.back();
    },
    transitionTo(route, model) {
      this.transitionTo(route, model);
    }
  }
});
