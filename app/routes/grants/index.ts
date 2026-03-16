import { service } from '@ember/service';
import CheckSessionRoute from '../check-session-route';
import { query } from 'pass-ui/builders/pass-api';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type GrantsIndexController from 'pass-ui/controllers/grants/index';
import type { PaginationMeta, JsonApiDocument } from 'pass-ui/types/json-api';
import type AppStore from 'pass-ui/services/store';

interface GrantsIndexModel {
  grantMap: Array<{ grant: GrantModel; submissions: SubmissionModel[] }>;
  meta: PaginationMeta | undefined;
}

interface GrantsIndexParams {
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
  async model(params: GrantsIndexParams): Promise<GrantsIndexModel | undefined> {
    const user = this.currentUser.user;
    if (!user) {
      return;
    }

    const grantQueryHash = grantsIndexGrantQuery(params, user);
    // First search for all Grants associated with the current user
    const { content: grantContent }: JsonApiDocument<GrantModel[]> = await this.store.request(
      query('grant', grantQueryHash),
    );
    const grants = grantContent.data;
    const results: GrantsIndexModel = {
      grantMap: [],
      meta: grantContent.meta,
    };

    grants.forEach((grant: GrantModel) => {
      results.grantMap.push({
        grant,
        submissions: [],
      });
    });

    // TODO: submissions should be fetched separately from grants
    // We can redo the mapping of submissions onto grants (to get the count)
    // On demand without reloading the list of submissions
    const submissionQueryHash = grantsIndexSubmissionQuery(user);
    const { content: subContent }: JsonApiDocument<SubmissionModel[]> = await this.store.request(
      query('submission', submissionQueryHash),
    );
    const subs = subContent.data;
    subs.forEach((submission: SubmissionModel) => {
      submission.grants.forEach((grant: GrantModel) => {
        const match = results.grantMap.find(
          (res: { grant: GrantModel; submissions: SubmissionModel[] }) => res.grant.id === grant.id,
        );
        if (match) {
          match.submissions.push(submission);
        }
      });
    });

    return results;
  }

  setupController(controller: GrantsIndexController, model: GrantsIndexModel): void {
    super.setupController(controller, model);
    controller.queuedModel = model;
  }
}
