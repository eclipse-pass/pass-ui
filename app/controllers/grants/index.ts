/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

export default class GrantsIndexController extends Controller {
  @service declare currentUser: CurrentUserService;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('emt-themes/pass-table-theme') declare themeInstance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.faqUrl = this.staticConfig.config?.branding?.pages?.['faqUrl'] ?? null;
  }

  // TODO Reduce duplication in column definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminColumns: Array<Record<string, any>> = [
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
      component: 'dateCell',
    },
    {
      propertyName: 'grant.endDate',
      title: 'End',
      disableFiltering: true,
      className: 'date-column',
      component: 'dateCell',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  piColumns: Array<Record<string, any>> = [
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
      component: 'dateCell',
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

  @tracked faqUrl: string | null = null;
  // Bound to message dialog.
  @tracked messageShow: boolean = false;
  @tracked messageTo: string = '';
  @tracked messageSubject: string = '';
  @tracked messageText: string = '';
  // @ts-expect-error TS2729 - @service creates a prototype getter, available during field init
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked user: any = this.currentUser.user;

  queryParams: string[] = ['page', 'pageSize', 'filter'];

  @tracked page: number = 1;
  @tracked pageSize: number = 10;
  tablePageSizeValues: number[] = [10, 25, 50]; // TODO: Make configurable?
  @tracked filter: string | undefined;

  filterQueryParameters: Record<string, string> = {
    pageSize: 'pageSize',
    page: 'page',
    globalFilter: 'filter',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked queuedModel: any;

  // Columns displayed depend on the user role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get columns(): Array<Record<string, any>> {
    if (this.user.isAdmin) {
      return this.adminColumns;
    } else if (this.user.isSubmitter) {
      return this.piColumns;
    }
    console.warn(`[Route:Grants/index] User has no known role (${this.user.id}::${this.user.roles})`);
    return [];
  }

  get itemsCount(): number | undefined {
    return this.queuedModel.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel.meta?.page?.totalPages;
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
    const user = this.currentUser.user;
    if (!user) {
      return;
    }
    // default values provided to force these params in the request to the backend
    // TODO: make default pageSize configurable
    const grantQuery = grantsIndexGrantQuery(params, user);
    const submissionQuery = grantsIndexSubmissionQuery(user);

    return (
      this.store
        .query('grant', grantQuery)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          const meta = data.meta;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const results = data.map((grant: any) => ({
            grant,
            submissions: [],
          }));

          return {
            grantMap: results,
            meta,
          };
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(async (results: any) => {
          // TODO: (see todo in the route)
          // Refactor to not reload submissions each refresh
          // Only need to update the mapping (counts)
          const subs = await this.store.query('submission', submissionQuery);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          subs.forEach((submission: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            submission.grants.forEach((grant: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const match = results.grantMap.find((res: any) => res.grant.id === grant.id);
              if (match) {
                match.submissions.push(submission);
              }
            });
          });
          return results;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((results: any) => {
          this.queuedModel = results;
        })
    );
  }
}
