import { A } from '@ember/array';
import CheckSessionRoute from '../check-session-route';
import { hash, defer } from 'rsvp';
import { inject as service } from '@ember/service';

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
          submissions: A()
        });
      });

      // Then search for all Submissions associated with the returned Grants
      const query = {
        query: {
          bool: {
            must: { terms: { grants: grantIds } },
            must_not: { term: { submissionStatus: 'cancelled' } }
          }
        },
        size: querySize
      };
      this.get('store').query('submission', query).then((subs) => {
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
