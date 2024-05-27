/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';

export default class GrantsIndexController extends Controller {
  @service currentUser;
  @service('app-static-config') staticConfig;
  @service('emt-themes/bootstrap4') themeInstance;
  @service router;
  @service store;

  constructor() {
    super(...arguments);

    this.faqUrl = this.staticConfig.config.branding.pages.faqUrl;
  }

  // TODO Reduce duplication in column definitions
  adminColumns = [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      className: 'projectname-column',
      component: 'grantLinkCell',
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
      component: 'grantLinkCell',
    },
    {
      title: 'PI',
      propertyName: 'grant.pi',
      component: 'piListCell',
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
      component: 'grantLinkCell',
    },
  ];

  piColumns = [
    {
      propertyName: 'grant.projectName',
      title: 'Project Name',
      className: 'projectname-column',
      component: 'grantLinkCell',
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
      component: 'grantLinkCell',
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
      component: 'grantSubmissionCell',
    },
    {
      propertyName: 'grant.awardStatus',
      title: 'Status',
      filterWithSelect: true,
    },
    {
      title: 'Actions',
      component: 'grantActionCell',
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

  @tracked page = 1;
  @tracked pageSize = 10;
  tablePageSizeValues = [10, 25, 50]; // TODO: Make configurable?
  @tracked filter;

  filterQueryParameters = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  @tracked queuedModel;

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
    const user = this.currentUser.user;
    if (!user) {
      return;
    }
    // default values provided to force these params in the request to the backend
    // TODO: make default pageSize configurable
    const grantQuery = grantsIndexGrantQuery(params, user);
    const submissionQuery = grantsIndexSubmissionQuery(user);

    return this.store
      .query('grant', grantQuery)
      .then((data) => {
        const meta = data.meta;
        let results = data.map((grant) => ({
          grant,
          submissions: [],
        }));

        return {
          grantMap: results,
          meta,
        };
      })
      .then(async (results) => {
        // TODO: (see todo in the route)
        // Refactor to not reload submissions each refresh
        // Only need to update the mapping (counts)
        const subs = await this.store.query('submission', submissionQuery);
        subs.forEach((submission) => {
          submission.grants.forEach((grant) => {
            let match = results.grantMap.find((res) => res.grant.id === grant.id);
            if (match) {
              match.submissions.pushObject(submission);
            }
          });
        });
        return results;
      })
      .then((results) => {
        this.queuedModel = results;
      });
  }
}
