import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { query } from 'pass-ui/builders/pass-api';
import { submissionsIndexQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionModel from 'pass-ui/models/submission';

interface SubmissionsIndexModel {
  submissions: SubmissionModel[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

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
  async model(params: any): Promise<SubmissionsIndexModel> {
    const queryHash = submissionsIndexQuery(params, this.currentUser.user!);
    const { content } = await this.store.request(query('submission', queryHash));
    return {
      submissions: content.data,
      meta: content.meta,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupController(controller: any, model: any): void {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
