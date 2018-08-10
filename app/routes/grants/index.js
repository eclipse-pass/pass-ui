import CheckSessionRoute from '../check-session-route';
import { hash, defer } from 'rsvp';

const { service } = Ember.inject;

export default CheckSessionRoute.extend({
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
    const grantQuery = {
      sort: [
        'awardStatus',
        { endDate: 'desc' }
      ],
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
      size: querySize
    };

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
});
