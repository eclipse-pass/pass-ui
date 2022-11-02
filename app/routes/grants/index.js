/* eslint-disable ember/no-get */
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import CheckSessionRoute from '../check-session-route';
import { defer } from 'rsvp';
import { get } from '@ember/object';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;

  /**
   * TODO: Should be able to streamline this.
   * Can we use the 'include' parameter: search for submissions, as below
   * and sideload the grants data with it?
   *
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
    const user = get(this, 'currentUser.user');
    if (!user) {
      return;
    }

    const userId = user.get('id');

    let promise = defer();
    //   // TODO: ignoring the endDate > 2011-01-01 query part for now
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '+awardStatus,-endDate',
    };

    // First search for all Grants associated with the current user
    this.store.query('grant', grantQuery).then((grants) => {
      let results = [];
      let grantIds = [];

      grants.forEach((grant) => {
        grantIds.push(grant.get('id'));

        results.push({
          grant,
          submissions: A(),
        });
      });

      const userMatch = `grants.pi.id==${userId},grants.coPis.id==${userId}`;
      const submissionQuery = {
        filter: {
          submission: `submissionStatus=out=cancelled;(${userMatch})`,
        },
      };

      this.store.query('submission', submissionQuery).then((subs) => {
        subs.forEach((submission) => {
          submission.get('grants').forEach((grant) => {
            let match = results.find((res) => res.grant.get('id') === grant.get('id'));
            if (match) {
              match.submissions.pushObject(submission);
            }
          });
        });

        promise.resolve(results);
      });
    });

    return promise.promise;
  }
}
