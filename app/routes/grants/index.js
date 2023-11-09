import { service } from '@ember/service';
import { A } from '@ember/array';
import CheckSessionRoute from '../check-session-route';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: { refreshModel: true },
    pageSize: { refreshModel: true },
    globalSearch: {},
  };

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
  async model(params) {
    const user = this.currentUser.user;
    if (!user) {
      return;
    }

    const userId = user.id;
    // default values provided to force these params in the request to the backend
    // TODO: make default pageSize configurable
    const { page = 1, pageSize = 10 } = params;

    // TODO: ignoring the endDate > 2011-01-01 query part for now
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '+awardStatus,-endDate',
      page: {
        number: page,
        size: pageSize,
        totals: true,
      },
    };

    // First search for all Grants associated with the current user
    const grants = await this.store.query('grant', grantQuery);
    let results = {
      grantMap: [],
      meta: grants.meta,
    };

    grants.forEach((grant) => {
      results.grantMap.push({
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
        let match = results.grantMap.find((res) => res.grant.id === grant.id);
        if (match) {
          match.submissions.pushObject(submission);
        }
      });
    });

    return results;
  }
}
