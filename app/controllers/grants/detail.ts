import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { query } from 'pass-ui/builders/pass-api';
import { grantDetailsQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface PaginationMeta {
  page?: { totalRecords?: number; totalPages?: number };
}

interface GrantDetailModel {
  grant: GrantModel;
  submissions: {
    data: SubmissionModel[];
    meta: PaginationMeta;
  };
}

interface QueuedGrantDetailModel {
  submissions?: {
    data: SubmissionModel[];
    meta: PaginationMeta;
  };
}

export default class GrantDetailsController extends Controller {
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  declare model: GrantDetailModel;

  get grant(): GrantModel {
    return this.model.grant;
  }

  @tracked queuedModel: QueuedGrantDetailModel | undefined;

  queryParams: string[] = ['page', 'pageSize', 'filter'];

  @tracked page: number = 1;
  @tracked pageSize: number = 10;
  @tracked filter: string | undefined;

  tablePageSizeValues: number[] = [10, 25, 50];

  get itemsCount(): number | undefined {
    return this.queuedModel?.submissions?.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel?.submissions?.meta?.page?.totalPages;
  }

  @action
  handleTableChange({ page, pageSize, filter }: { page: number; pageSize: number; filter: string }): void {
    this.page = page;
    this.pageSize = pageSize;
    this.filter = filter || undefined;
    this.fetchData();
  }

  fetchData() {
    const queryHash = grantDetailsQuery(
      { page: this.page, pageSize: this.pageSize, filter: this.filter },
      this.grant.id!,
      this.currentUser.user!,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.request(query('submission', queryHash)).then((result: any) => {
      this.queuedModel = {
        submissions: {
          data: result.content.data,
          meta: result.content.meta,
        },
      };
    });
  }
}
