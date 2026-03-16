import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { query } from 'pass-ui/builders/pass-api';
import { submissionsIndexQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionModel from 'pass-ui/models/submission';
import type SubmissionsIndexController from 'pass-ui/controllers/submissions/index';
import type { PaginationMeta, JsonApiDocument } from 'pass-ui/types/json-api';
import type AppStore from 'pass-ui/services/store';

interface SubmissionsIndexModel {
  submissions: SubmissionModel[];
  meta: PaginationMeta | undefined;
}

interface SubmissionsIndexParams {
  page?: number;
  pageSize?: number;
  filter?: string;
}

export default class IndexRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  @service declare store: AppStore;

  queryParams = {
    page: { refreshModel: true },
    pageSize: { refreshModel: true },
    filter: { refreshModel: true },
  };

  async model(params: SubmissionsIndexParams): Promise<SubmissionsIndexModel> {
    const queryHash = submissionsIndexQuery(params, this.currentUser.user!);
    const { content }: JsonApiDocument<SubmissionModel[]> = await this.store.request(query('submission', queryHash));
    return {
      submissions: content.data,
      meta: content.meta,
    };
  }

  setupController(controller: SubmissionsIndexController, model: SubmissionsIndexModel): void {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
