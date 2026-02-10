import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { submissionsIndexQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async model(params: any): Promise<any> {
    const query = submissionsIndexQuery(params, this.currentUser.user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.query('submission', query).then((data: any) => ({
      submissions: data,
      meta: data.meta,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupController(controller: any, model: any): void {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
