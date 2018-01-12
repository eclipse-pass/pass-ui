import Route from '@ember/routing/route';

// For development purposes, store is seeded with objects

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
