import Route from '@ember/routing/route';

const {
  service,
} = Ember.inject;

export default Route.extend({
  currentUser: service(),

  resetController(controller, isExiting, transition) {
    // Explicitly clear the 'grant' query parameter when reloading this route
    if (isExiting) {
      controller.get('queryParams').forEach(param => controller.set(param, null));
      this.get('store').peekAll('submission').forEach(s => s.rollbackAttributes());
    }
  },

  /**
   * Check the user roles. If user is not a Submitter, prevent navigation to this route
   */
  beforeModel(transition) {
    if (!this.get('currentUser.user.isSubmitter')) {
      transition.abort();
    }
  },

  // Return a promise to load count objects starting at offsefrom of given type.
  loadObjects(type, offset, count) {
    return this.get('store').query(type, { query: { match_all: {} }, from: offset, size: count });
  },

  // TODO MUST be refactored to load (all) related objects more intelligently
  model(params) {
    let preLoadedGrant = null;
    let newSubmission = null;
    let publication = this.get('store').createRecord('publication');

    if (params.grant) {
      preLoadedGrant = this.get('store').findRecord('grant', params.grant);
    }

    const querySize = 500;
    const defaultSort = [{ endDate: 'desc' }];

    let grantsQuery;
    if (this.get('currentUser.user.isAdmin')) {
      grantsQuery = this.getAdminGrantQuery(0, querySize, defaultSort);
    } else if (this.get('currentUser.user.isSubmitter')) {
      grantsQuery = this.getSubmitterGrantQuery(0, querySize, defaultSort);
    } else {
      return;
    }

    const grants = this.get('store').query('grant', grantsQuery);

    const repositories = this.loadObjects('repository', 0, querySize);
    const funders = this.loadObjects('funder', 0, querySize);
    const policies = this.loadObjects('policy', 0, querySize);

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
  },

  getAdminGrantQuery(from, size, sort) {
    return {
      sort,
      query: { range: { endDate: { gte: '2011-01-01' } } },
      from,
      size,
    };
  },
  getSubmitterGrantQuery(from, size, sort) {
    return {
      sort,
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
      from,
      size,
    };
  }
});
