/* eslint-disable ember/no-classic-classes */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { grantDetailsQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class GrantDetailsController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('emt-themes/pass-table-theme') declare themeInstance: any;
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare model: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get grant(): any {
    return this.model.grant;
  }

  // Columns displayed depend on the user role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Array<Record<string, any>> = [
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked queuedModel: any;

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
    return this.queuedModel.submissions?.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel.submissions?.meta?.page?.totalPages;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  displayAction(display: any): void {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doQuery(params: any): any {
    const query = grantDetailsQuery(params, this.grant.id, this.currentUser.user);
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
