/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class GrantsIndexController extends Controller {
  @service currentUser;
  @service('app-static-config') configurator;
  @service('emt-themes/bootstrap4') themeInstance;
  @service router;

  constructor() {
    super(...arguments);

    this.configurator.getStaticConfig().then((config) => this.set('faqUrl', config.branding.pages.faqUrl));
  }

  // TODO Reduce duplication in column definitions
  adminColumns = [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      className: 'projectname-column',
      component: 'grant-link-cell',
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Funder',
      className: 'funder-column',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Award Number',
      className: 'awardnum-column',
      disableFiltering: true,
      component: 'grant-link-cell',
    },
    {
      title: 'PI',
      propertyName: 'grant.pi',
      component: 'pi-list-cell',
    },
    {
      propertyName: 'grant.startDate',
      title: 'Start',
      disableFiltering: true,
      className: 'date-column',
      component: 'date-cell',
    },
    {
      propertyName: 'grant.endDate',
      title: 'End',
      disableFiltering: true,
      className: 'date-column',
      component: 'date-cell',
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
      predefinedFilterOptions: ['Active', 'Ended'],
    },
    {
      propertyName: 'submissions.length',
      title: 'Submissions count',
      disableFiltering: true,
      component: 'grant-link-cell',
    },
  ];

  piColumns = [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      className: 'projectname-column',
      component: 'grant-link-cell',
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Funder',
      className: 'funder-column',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Award #',
      className: 'awardnum-column',
      disableFiltering: true,
      component: 'grant-link-cell',
    },
    {
      propertyName: 'grant.endDate',
      title: 'End Date',
      disableFiltering: true,
      className: 'date-column',
      component: 'date-cell',
    },
    {
      propertyName: 'submissions.length',
      title: '# of Submissions',
      disableFiltering: true,
      component: 'grant-submission-cell',
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
    },
    {
      title: 'Actions',
      component: 'grant-action-cell',
    },
  ];

  @tracked faqUrl = null;
  // Bound to message dialog.
  @tracked messageShow = false;
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked user = this.currentUser.user;

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

  // Columns displayed depend on the user role
  get columns() {
    if (this.user.isAdmin) {
      return this.adminColumns;
    } else if (this.user.isSubmitter) {
      return this.piColumns;
    }
    console.warn(`[Route:Grants/index] User has no known role (${this.user.id}::${this.user.roles})`);
    return [];
  }

  get itemsCount() {
    return this.model?.meta?.page?.totalRecords;
  }

  get pagesCount() {
    return this.model?.meta?.page?.totalPages;
  }

  @action
  displayAction(display) {
    this.page = display.currentPageNumber;
    this.pageSize = display.pageSize;
    this.filter = display.filterString;
  }

  @action
  doQuery(query) {
    return this.router.transitionTo({ queryParams: { ...query } });
  }
}
