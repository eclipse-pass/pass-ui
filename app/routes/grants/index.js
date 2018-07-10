import Route from '@ember/routing/route';
import { hash, defer } from 'rsvp';

const { service } = Ember.inject;

export default Route.extend({
  currentUser: service('current-user'),

  /**
   * Returns model:
   *  [
   *    {
   *      'grant': { ... },
   *      'submissions': [ ... ]
   *    },
   *    ...
   *  ]
   */
  model() {
    const user = this.get('currentUser.user');
    if (!user) {
      return;
    }

    let promise = defer();
    const querySize = 500;
    const defaultSort = ['awardStatus', { endDate: 'desc' }];

    let grantQuery;
    if (user.get('isAdmin')) {
      grantQuery = this.getAdminQuery(defaultSort, querySize);
    } else if (user.get('isSubmitter')) {
      grantQuery = this.getSubmitterQuery(defaultSort, querySize, user);
    } else {
      return;
    }

    // First search for all Grants associated with the current user
    this.get('store').query('grant', grantQuery).then((grants) => {
      let results = [];
      let grantIds = [];

      grants.forEach((grant) => {
        grantIds.push(grant.get('id'));

        results.push({
          grant,
          submissions: Ember.A()
        });
      });

      // Then search for all Submissions associated with the returned Grants
      this.get('store').query('submission', { query: { terms: { grants: grantIds } }, size: querySize }).then((subs) => {
        subs.forEach((submission) => {
          submission.get('grants').forEach((grant) => {
            let match = results.find(res => res.grant.get('id') === grant.get('id'));
            if (match) {
              match.submissions.pushObject(submission);
            }
          });
        });

        promise.resolve(results);
      });
    });

    return promise.promise;
  },

  getAdminQuery(sort, size) {
    return {
      sort,
      query: {
        range: { endDate: { gte: '2011-01-01' } }
      },
      size
    };
  },

  getSubmitterQuery(sort, size, user) {
    return {
      sort,
      query: {
        bool: {
          must: [
            { range: { endDate: { gte: '2011-01-01' } } },
            {
              bool: {
                should: [
                  { term: { pi: user.get('id') } },
                  { term: { coPis: user.get('id') } }
                ]
              }
            }
          ]
        }
      },
      size
    };
  }
});
