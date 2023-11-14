/* eslint-disable ember/no-classic-classes */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class GrantDetailsController extends Controller {
  @service('emt-themes/bootstrap4') themeInstance;
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

  @tracked queuedModel;

  queryParams = ['page', 'pageSize', 'filter'];

  @tracked page;
  @tracked pageSize = 10;
  @tracked filter;

  tablePageSizeValues = [10, 25, 50];
  filterQueryParameters = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  get itemsCount() {
    return this.queuedModel.submissions.meta?.page?.totalRecords;
  }

  get pagesCount() {
    return this.queuedModel.submissions.meta?.page?.totalPages;
  }

  get submissionsQuery() {
    /**
     * TODO:
     * TMP restriction - don't show submissions that are in DRAFT status
     * unless you are the submitter OR preparer
     * Show submissions where `submitted===true`, because they are no longer editable
     */
    const userId = this.currentUser.user.id;
    const userMatch = `submitted==true,(submitter.id==${userId},preparers.id=in=${userId})`;
    return {
      filter: {
        submission: `grants.id==${this.grant.id};submissionStatus=out=cancelled;(${userMatch})`,
      },
    };
  }

  @action
  displayAction(display) {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  doQuery(params) {
    const { page = 1, pageSize = 10 } = params;
    let query = this.submissionsQuery;
    query.page = {
      number: page,
      size: pageSize,
      totals: true,
    };

    if (params.filter) {
      query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
    }

    let submissions = this.store.query('submission', query).then((data) => {
      this.queuedModel = {
        submissions: {
          data,
          meta: data.meta,
        },
      };
    });

    // Don't need to re-load the grant
    return submissions;
  }
}
