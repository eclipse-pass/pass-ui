/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SubmissionsIndex extends Controller {
  @service currentUser;
  @service('app-static-config') configurator;
  @service('emt-themes/bootstrap4') themeInstance;
  @service router;

  @tracked faqUrl = null;
  // Bound to message dialog.
  @tracked messageShow = false;
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked tablePageSize = 50;

  queryParams = ['page', 'pageSize', 'filter'];

  @tracked page;
  @tracked pageSize;
  tablePageSizeValues = [10, 25, 50]; // TODO: Make configurable?
  @tracked filter;

  filterQueryParameters = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  constructor() {
    super(...arguments);

    this.configurator.getStaticConfig().then((config) => this.set('faqUrl', config.branding.pages.faqUrl));
  }

  // Columns displayed depend on the user role
  get columns() {
    if (this.currentUser.user.isAdmin) {
      return [
        {
          propertyName: 'publication',
          title: 'Article',
          className: 'title-column',
          component: 'submissions-article-cell',
        },
        {
          title: 'Award Number (Funder)',
          className: 'awardnum-funder-column',
          component: 'submissions-award-cell',
        },
        {
          propertyName: 'repositories',
          title: 'Repositories',
          className: 'repositories-column',
          component: 'submissions-repo-cell',
        },
        {
          propertyName: 'submittedDate',
          title: 'Submitted Date',
          className: 'date-column',
          component: 'date-cell',
        },
        {
          propertyName: 'submissionStatus',
          title: 'Status',
          className: 'status-column',
          component: 'submissions-status-cell',
        },
        {
          // propertyName: 'repoCopies',
          title: 'Manuscript IDs',
          className: 'msid-column',
          component: 'submissions-repoid-cell',
        },
      ];
    } else if (this.currentUser.user.isSubmitter) {
      return [
        {
          propertyName: 'publicationTitle',
          className: 'title-column',
          title: 'Article',
          component: 'submissions-article-cell',
        },
        {
          title: 'Award Number (Funder)',
          propertyName: 'grantInfo',
          className: 'awardnum-funder-column',
          component: 'submissions-award-cell',
          disableSorting: true,
        },
        {
          propertyName: 'repositoryNames',
          title: 'Repositories',
          component: 'submissions-repo-cell',
          className: 'repositories-column',
          disableSorting: true,
        },
        {
          propertyName: 'submittedDate',
          title: 'Submitted Date',
          className: 'date-column',
          component: 'date-cell',
        },
        {
          propertyName: 'submissionStatus',
          title: 'Status',
          className: 'status-column',
          component: 'submissions-status-cell',
        },
        {
          propertyName: 'repoCopies',
          className: 'msid-column',
          title: 'Manuscript IDs',
          component: 'submissions-repoid-cell',
          disableSorting: true,
        },
        {
          title: 'Actions',
          className: 'actions-column',
          component: 'submission-action-cell',
        },
      ];
    } else {
      console.warn(
        `[Controller:Submissions/index] User has no known role (${this.currentUser.user.id}::${this.currentUser.user.roles})`
      );
      return [];
    }
  }

  get itemsCount() {
    return this.model.submissions?.meta?.page?.totalRecords;
  }

  get pagesCount() {
    return this.model.submissions?.meta?.page?.totalPages;
  }

  @action
  displayAction(display) {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  doQuery(query) {
    console.log(`[Controller:Submissions/index] doQuery :: ${JSON.stringify(query)}`);
    return this.router.transitionTo({ queryParams: { ...query } });
  }
}
