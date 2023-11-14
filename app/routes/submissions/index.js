import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  async model(params) {
    let query;

    const user = this.currentUser.user;

    if (user.isAdmin) {
      query = {
        filter: { submission: 'submissionStatus=out=cancelled' },
        include: 'publication',
      };
    } else if (user.isSubmitter) {
      const userMatch = `submitter.id==${user.id},preparers.id=in=${user.id}`;
      query = {
        filter: {
          submission: `(${userMatch});submissionStatus=out=cancelled`,
        },
        sort: '-submittedDate',
        include: 'publication',
      };
    }

    const { page = 1, pageSize = 10 } = params;
    query.page = {
      number: page,
      size: pageSize,
      totals: true,
    };

    if (params.filter) {
      query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
    }

    return this.store.query('submission', query).then((data) => ({
      submissions: data,
      meta: data.meta,
    }));
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.queuedModel = model;
  }
}
