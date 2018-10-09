import CheckSessionRoute from '../check-session-route';

const {
  service,
} = Ember.inject;

export default CheckSessionRoute.extend({
  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.get('queryParams').forEach(param => controller.set(param, null));
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
    let submissionEvents = null;
    let files = null;
    let publication = this.get('store').createRecord('publication');

    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    const querySize = 100;

    const repositories = this.loadObjects('repository', 0, 500);
    const funders = this.loadObjects('funder', 0, 500);
    const grants = this.get('store').query('grant', {
      sort: [
        { endDate: 'desc' }
      ],
      query: {
        bool: {
          must: [
            { range: { endDate: { gte: '2011-01-01' } } },
            {
              bool: {
                should: [
                  { term: { pi: this.get('currentUser.user.id') } },
                  { term: { coPis: this.get('currentUser.user.id') } }
                ]
              }
            }
          ]
        }
      },
      from: 0,
      size: 500,
    });

    const policies = this.loadObjects('policy', 0, 500);

    if (params.submission) {
      return this.get('store').findRecord('submission', params.submission).then((sub) => {
        console.log('submission found!');
        newSubmission = this.get('store').findRecord('submission', params.submission);
        publication = sub.get('publication');
        submissionEvents = this.get('store').query('submissionEvent', {
          term: {
            submission: sub.get('id')
          }
        });
        files = this.get('store').query('file', {
          term: {
            submission: sub.get('id')
          }
        });
        return Ember.RSVP.hash({
          repositories,
          newSubmission,
          submissionEvents,
          publication,
          grants,
          policies,
          funders,
          preLoadedGrant,
          files
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
