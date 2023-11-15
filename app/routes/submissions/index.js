import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { submissionsIndexQuery } from '../../util/paginated-query';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') currentUser;
  @service store;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  async model(params) {
    const query = submissionsIndexQuery(params, this.currentUser.user);
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
