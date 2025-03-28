/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { submissionsIndexQuery } from '../../util/paginated-query';

export default class SubmissionsIndex extends Controller {
  @service currentUser;
  @service('app-static-config') staticConfig;
  @service('emt-themes/bootstrap4') themeInstance;
  @service router;
  @service store;

  @tracked faqUrl = null;
  // Bound to message dialog.
  @tracked messageShow = false;
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked tablePageSize = 50;

  @tracked queuedModel;

  queryParams = ['page', 'pageSize', 'filter'];

  @tracked page = 1;
  @tracked pageSize = 10;
  tablePageSizeValues = [10, 25, 50]; // TODO: Make configurable?
  @tracked filter;

  filterQueryParameters = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  constructor() {
    super(...arguments);

    this.faqUrl = this.staticConfig.config?.branding?.pages?.faqUrl;
  }

  // Columns displayed depend on the user role
  get columns() {
    if (this.currentUser.user.isAdmin) {
      return [
        {
          propertyName: 'publication',
          title: 'Article',
          className: 'title-column',
          component: 'submissionsArticleCell',
        },
        {
          title: 'Award Number (Funder)',
          className: 'awardnum-funder-column',
          component: 'submissionsAwardCell',
        },
        {
          propertyName: 'repositories',
          title: 'Repositories',
          className: 'repositories-column',
          component: 'submissionsRepoCell',
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
          // propertyName: 'repoCopies',
          title: 'Manuscript IDs',
          className: 'msid-column',
          component: 'submissionsRepoidCell',
        },
      ];
    } else if (this.currentUser.user.isSubmitter) {
      return [
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
    } else {
      console.warn(
        `[Controller:Submissions/index] User has no known role (${this.currentUser.user.id}::${this.currentUser.user.roles})`,
      );
      return [];
    }
  }

  get itemsCount() {
    return this.queuedModel.meta?.page?.totalRecords;
  }

  get pagesCount() {
    return this.queuedModel.meta?.page?.totalPages;
  }

  @action
  displayAction(display) {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  doQuery(params) {
    const query = submissionsIndexQuery(params, this.currentUser.user);
    return this.store.query('submission', query).then((data) => {
      this.queuedModel = {
        submissions: data,
        meta: data.meta,
      };
    });
  }
}
