import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { query } from 'pass-ui/builders/pass-api';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type { PaginationMeta, JsonApiDocument } from 'pass-ui/types/json-api';

interface GrantMapEntry {
  grant: GrantModel;
  submissions: SubmissionModel[];
}

interface GrantsIndexModel {
  grantMap: GrantMapEntry[];
  meta: PaginationMeta | undefined;
}

export default class GrantsIndexController extends Controller {
  @service declare currentUser: CurrentUserService;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.faqUrl = this.staticConfig.config?.branding?.pages?.['faqUrl'] ?? null;
  }

  @tracked faqUrl: string | null = null;
  // Bound to message dialog.
  @tracked messageShow: boolean = false;
  @tracked messageTo: string = '';
  @tracked messageSubject: string = '';
  @tracked messageText: string = '';

  queryParams: string[] = ['page', 'pageSize', 'filter'];

  @tracked page: number = 1;
  @tracked pageSize: number = 10;
  tablePageSizeValues: number[] = [10, 25, 50];
  @tracked filter: string | undefined;

  @tracked queuedModel: GrantsIndexModel | undefined;

  get itemsCount(): number | undefined {
    return this.queuedModel?.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel?.meta?.page?.totalPages;
  }

  @action
  handleTableChange({ page, pageSize, filter }: { page: number; pageSize: number; filter: string }): void {
    this.page = page;
    this.pageSize = pageSize;
    this.filter = filter || undefined;
    this.fetchData();
  }

  private _mapSubmissionsToGrants(submissions: SubmissionModel[], grantMap: GrantMapEntry[]): void {
    submissions.forEach((submission: SubmissionModel) => {
      submission.grants.forEach((grant: GrantModel) => {
        const match = grantMap.find((res: GrantMapEntry) => res.grant.id === grant.id);
        if (match) {
          match.submissions.push(submission);
        }
      });
    });
  }

  fetchData() {
    const user = this.currentUser.user;
    if (!user) {
      return;
    }
    const grantQueryHash = grantsIndexGrantQuery(
      { page: this.page, pageSize: this.pageSize, filter: this.filter },
      user,
    );
    const submissionQueryHash = grantsIndexSubmissionQuery(user);

    return this.store
      .request(query('grant', grantQueryHash))
      .then((result: JsonApiDocument<GrantModel[]>) => {
        const data = result.content.data;
        const meta = result.content.meta;
        const results = data.map((grant: GrantModel) => ({
          grant,
          submissions: [] as SubmissionModel[],
        }));

        return {
          grantMap: results,
          meta,
        };
      })
      .then(async (results: GrantsIndexModel) => {
        const { content: subsDoc }: JsonApiDocument<SubmissionModel[]> = await this.store.request(
          query('submission', submissionQueryHash),
        );
        this._mapSubmissionsToGrants(subsDoc.data, results.grantMap);
        return results;
      })
      .then((results: GrantsIndexModel) => {
        this.queuedModel = results;
      });
  }
}
