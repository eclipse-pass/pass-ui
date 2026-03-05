import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { submissionsIndexQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type SubmissionModel from 'pass-ui/models/submission';

interface SubmissionsIndexModel {
  submissions: SubmissionModel[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

export default class SubmissionsIndex extends Controller {
  @service declare currentUser: CurrentUserService;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @tracked faqUrl: string | null = null;
  // Bound to message dialog.
  @tracked messageShow: boolean = false;
  @tracked messageTo: string = '';
  @tracked messageSubject: string = '';
  @tracked messageText: string = '';

  @tracked queuedModel: SubmissionsIndexModel | undefined;

  queryParams: string[] = ['page', 'pageSize', 'filter'];

  @tracked page: number = 1;
  @tracked pageSize: number = 10;
  tablePageSizeValues: number[] = [10, 25, 50];
  @tracked filter: string | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.faqUrl = this.staticConfig.config?.branding?.pages?.['faqUrl'] ?? null;
  }

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

  fetchData() {
    const query = submissionsIndexQuery(
      { page: this.page, pageSize: this.pageSize, filter: this.filter },
      this.currentUser.user!,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.query('submission', query).then((data: any) => {
      this.queuedModel = {
        submissions: data,
        meta: data.meta,
      };
    });
  }
}
