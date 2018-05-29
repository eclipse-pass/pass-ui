import Route from '@ember/routing/route';

const {
  service,
} = Ember.inject;

export default Route.extend({
  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.set('grant', undefined);
      this.get('store').peekAll('submission').forEach(s => s.rollbackAttributes());
    }
  },

  currentUser: service(),

  // Return a promise to load count objects starting at offsefrom of given type.
  loadObjects(type, offset, count) {
    return this.get('store').query(type, { query: { match_all: {} }, from: offset, size: count });
  },

  model(params) {
    let preLoadedGrant = null;
    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    let publication = this.get('store').createRecord('publication');
    let newSubmission = this.get('store').createRecord('submission');

    const querySize = 100;

    const repositories = this.loadObjects('repository', 0, 50);
    const funders = this.loadObjects('funder', 0, 50);
    const grants = this.loadObjects('grant', 0, 50);
    const policies = this.loadObjects('policy', 0, 50);
    const journals = this.loadObjects('journal', 0, 50);
    const h = Ember.RSVP.hash({
      repositories,
      newSubmission,
      publication,
      grants,
      policies,
      journals,
      funders,
      preLoadedGrant
    });
    return h;
  }
});
