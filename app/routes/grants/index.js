import { service } from '@ember/service';
import { A } from '@ember/array';
import CheckSessionRoute from '../check-session-route';
import { defer } from 'rsvp';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user')
  currentUser;
  @service store;

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
  async model() {
    const user = this.currentUser.user;
    if (!user) {
      return;
    }

    const userId = user.id;

    let promise = defer();
    //   // TODO: ignoring the endDate > 2011-01-01 query part for now
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '+awardStatus,-endDate',
    };

    // First search for all Grants associated with the current user
    const grants = await this.store.query('grant', grantQuery);
    let results = [];
    let grantIds = [];

    grants.forEach((grant) => {
      grantIds.push(grant.id);

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

    const subs = await this.store.query('submission', submissionQuery);
    subs.forEach((submission) => {
      submission.grants.forEach((grant) => {
        let match = results.find((res) => res.grant.id === grant.id);
        if (match) {
          match.submissions.pushObject(submission);
        }
      });
    });

    return results;
  }
}
