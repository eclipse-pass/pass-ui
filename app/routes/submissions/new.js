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
    let newSubmission = null;
    let publication = this.get('store').createRecord('publication');

    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    const querySize = 100;

    const repositories = this.loadObjects('repository', 0, 500);
    const funders = this.loadObjects('funder', 0, 500);
    const grants = this.get('store').query('grant', {
      term: {
        pi: this.get('currentUser.user.id')
      },
      from: 0,
      size: 500,
    });

    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      return this.get('store').findRecord('submission', params.submission).then((sub) => {
        newSubmission = this.get('store').findRecord('submission', params.submission);
        publication = sub.get('publication');
        return Ember.RSVP.hash({
          repositories,
          newSubmission,
          publication,
          grants,
          policies,
          funders,
          preLoadedGrant
        });
      });
    }
    newSubmission = this.get('store').createRecord('submission');
    const h = Ember.RSVP.hash({
      repositories,
      newSubmission,
      publication,
      grants,
      policies,
      // journals,
      funders,
      preLoadedGrant
    });
    return h;
  }
});
