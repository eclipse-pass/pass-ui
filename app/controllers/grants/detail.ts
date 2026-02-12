/* eslint-disable ember/no-classic-classes */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { grantDetailsQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface GrantDetailModel {
  grant: GrantModel;
  submissions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: any;
  };
}

interface QueuedGrantDetailModel {
  submissions?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: any;
  };
}

interface TableColumnDef {
  propertyName?: string;
  title: string;
  className?: string;
  component?: string;
  disableSorting?: boolean;
}

interface DisplayAction {
  currentPageNumber: number;
  pageSize: number;
  filterString: string;
}

export default class GrantDetailsController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('emt-themes/pass-table-theme') declare themeInstance: any;
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  declare model: GrantDetailModel;

  get grant(): GrantModel {
    return this.model.grant;
  }

  // Columns displayed depend on the user role
  columns: TableColumnDef[] = [
    {
      propertyName: 'publicationTitle',
      className: 'title-column',
      title: 'Article',
      component: 'submissionsArticleCell',
    },
    {
      title: 'Award Number (Funder)',
      propertyName: 'grantInfo',
      className: 'awardnum-funder-column',
      component: 'submissionsAwardCell',
      disableSorting: true,
    },
    {
      propertyName: 'repositoryNames',
      title: 'Repositories',
      component: 'submissionsRepoCell',
      className: 'repositories-column',
      disableSorting: true,
    },
    {
      propertyName: 'submittedDate',
      title: 'Submitted Date',
      className: 'date-column',
      component: 'dateCell',
    },
    {
      propertyName: 'submissionStatus',
      title: 'Status',
      className: 'status-column',
      component: 'submissionsStatusCell',
    },
    {
      propertyName: 'repoCopies',
      className: 'msid-column',
      title: 'Manuscript IDs',
      component: 'submissionsRepoidCell',
      disableSorting: true,
    },
    {
      title: 'Actions',
      className: 'actions-column',
      component: 'submissionActionCell',
    },
  ];

  @tracked queuedModel: QueuedGrantDetailModel | undefined;

  queryParams: string[] = ['page', 'pageSize', 'filter'];

  @tracked page: number = 1;
  @tracked pageSize: number = 10;
  @tracked filter: string | undefined;

  tablePageSizeValues: number[] = [10, 25, 50];
  filterQueryParameters: Record<string, string> = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  get itemsCount(): number | undefined {
    return this.queuedModel?.submissions?.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel?.submissions?.meta?.page?.totalPages;
  }

  @action
  displayAction(display: DisplayAction): void {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doQuery(params: any) {
    const query = grantDetailsQuery(params, this.grant.id!, this.currentUser.user!);
    // Don't need to re-load the grant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.query('submission', query).then((data: any) => {
      this.queuedModel = {
        submissions: {
          data,
          meta: data.meta,
        },
      };
    });
  }
}
