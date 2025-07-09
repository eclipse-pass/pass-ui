/* eslint-disable ember/no-classic-classes */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { grantDetailsQuery } from '../../util/paginated-query';

export default class GrantDetailsController extends Controller {
  @service('emt-themes/pass-table-theme') themeInstance;
  @service currentUser;
  @service store;

  get grant() {
    return this.model.grant;
  }

  // Columns displayed depend on the user role
  columns = [
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

  @tracked queuedModel;

  queryParams = ['page', 'pageSize', 'filter'];

  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked filter;

  tablePageSizeValues = [10, 25, 50];
  filterQueryParameters = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  get itemsCount() {
    return this.queuedModel.submissions?.meta?.page?.totalRecords;
  }

  get pagesCount() {
    return this.queuedModel.submissions?.meta?.page?.totalPages;
  }

  @action
  displayAction(display) {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  doQuery(params) {
    const query = grantDetailsQuery(params, this.grant.id, this.currentUser.user);
    // Don't need to re-load the grant
    return this.store.query('submission', query).then((data) => {
      this.queuedModel = {
        submissions: {
          data,
          meta: data.meta,
        },
      };
    });
  }
}
