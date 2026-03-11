import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { hash } from 'rsvp';
import { query, findRecord } from 'pass-ui/builders/pass-api';
import { grantDetailsQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type GrantDetailsController from 'pass-ui/controllers/grants/detail';
import type { PaginationMeta, JsonApiDocument } from 'pass-ui/types/json-api';

/**
 * Grant details route: `grant/:id`
 * Display more details about a single grant. Included is a table of all submissions
 * that are associated with this grant.
 *
 * Getting the Grant object is simple from the backend. Getting associated submissions
 * is done through the search service (through Store.query)
 */

interface GrantDetailModel {
  grant: GrantModel;
  submissions: {
    data: SubmissionModel[];
    meta: PaginationMeta | undefined;
  };
}

interface GrantDetailParams {
  grant_id?: string;
  page?: number;
  pageSize?: number;
  filter?: string;
}

export default class DetailRoute extends CheckSessionRoute {
  @service('current-user') declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  queryParams = {
    page: {},
    pageSize: {},
    filter: {},
  };

  async model(params: GrantDetailParams): Promise<GrantDetailModel | void> {
    if (!params?.grant_id) {
      this.errorHandler.handleError(new Error('didNotLoadData'));
      return;
    }

    const grantPromise = this.store
      .request(findRecord('grant', params.grant_id, { include: 'pi,coPis,primaryFunder,directFunder' }))
      .then((result: JsonApiDocument<GrantModel>) => result.content.data);

    const submissionQueryHash = grantDetailsQuery(params, params.grant_id, this.currentUser.user!);
    const submissionsPromise = this.store
      .request(query('submission', submissionQueryHash))
      .then((result: JsonApiDocument<SubmissionModel[]>) => ({
        data: result.content.data,
        meta: result.content.meta,
      }));

    return hash({
      grant: grantPromise,
      submissions: submissionsPromise,
    });
  }

  setupController(controller: GrantDetailsController, model: GrantDetailModel): void {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
