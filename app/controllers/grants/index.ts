/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { grantsIndexGrantQuery, grantsIndexSubmissionQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type UserModel from 'pass-ui/models/user';

interface GrantMapEntry {
  grant: GrantModel;
  submissions: SubmissionModel[];
}

interface GrantsIndexModel {
  grantMap: GrantMapEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

interface TableColumnDef {
  propertyName?: string;
  title: string;
  className?: string;
  component?: string;
  filterWithSelect?: boolean;
  predefinedFilterOptions?: string[];
  disableFiltering?: boolean;
  disableSorting?: boolean;
}

interface DisplayAction {
  currentPageNumber: number;
  pageSize: number;
  filterString: string;
}

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
  adminColumns: TableColumnDef[] = [
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

  piColumns: TableColumnDef[] = [
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
  @tracked user: UserModel | null = this.currentUser.user;

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

  @tracked queuedModel: GrantsIndexModel | undefined;

  // Columns displayed depend on the user role
  get columns(): TableColumnDef[] {
    if (this.user?.isAdmin) {
      return this.adminColumns;
    } else if (this.user?.isSubmitter) {
      return this.piColumns;
    }
    console.warn(`[Route:Grants/index] User has no known role (${this.user?.id}::${this.user?.roles})`);
    return [];
  }

  get itemsCount(): number | undefined {
    return this.queuedModel?.meta?.page?.totalRecords;
  }

  get pagesCount(): number | undefined {
    return this.queuedModel?.meta?.page?.totalPages;
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
          const results = data.map((grant: GrantModel) => ({
            grant,
            submissions: [] as SubmissionModel[],
          }));

          return {
            grantMap: results,
            meta,
          };
        })
        .then(async (results: GrantsIndexModel) => {
          // TODO: (see todo in the route)
          // Refactor to not reload submissions each refresh
          const subs = await this.store.query('submission', submissionQuery);
          subs.forEach((submission: SubmissionModel) => {
            submission.grants.forEach((grant: GrantModel) => {
              const match = results.grantMap.find((res: GrantMapEntry) => res.grant.id === grant.id);
              if (match) {
                match.submissions.push(submission);
              }
            });
          });
          return results;
        })
        .then((results: GrantsIndexModel) => {
          this.queuedModel = results;
        })
    );
  }
}
