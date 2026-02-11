/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { submissionsIndexQuery } from '../../util/paginated-query';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type SubmissionModel from 'pass-ui/models/submission';

interface SubmissionsIndexModel {
  submissions: SubmissionModel[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

interface TableColumnDef {
  propertyName?: string;
  title: string;
  className?: string;
  component?: string;
  disableSorting?: boolean;
  filterWithSelect?: boolean;
  predefinedFilterOptions?: string[];
  disableFiltering?: boolean;
}

interface DisplayAction {
  currentPageNumber: number;
  pageSize: number;
  filterString: string;
}

export default class SubmissionsIndex extends Controller {
  @service declare currentUser: CurrentUserService;
  @service('app-static-config') declare staticConfig: AppStaticConfigService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service('emt-themes/pass-table-theme') declare themeInstance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  @tracked faqUrl: string | null = null;
  // Bound to message dialog.
  @tracked messageShow: boolean = false;
  @tracked messageTo: string = '';
  @tracked messageSubject: string = '';
  @tracked messageText: string = '';
  @tracked tablePageSize: number = 50;

  @tracked queuedModel: SubmissionsIndexModel | undefined;

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
  constructor(...args: any[]) {
    super(...args);

    this.faqUrl = this.staticConfig.config?.branding?.pages?.['faqUrl'] ?? null;
  }

  // Columns displayed depend on the user role
  get columns(): TableColumnDef[] {
    if (this.currentUser.user!.isAdmin) {
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
    } else if (this.currentUser.user!.isSubmitter) {
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
        `[Controller:Submissions/index] User has no known role (${this.currentUser.user!.id}::${this.currentUser.user!.roles})`,
      );
      return [];
    }
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
  doQuery(params: any): Promise<void> {
    const query = submissionsIndexQuery(params, this.currentUser.user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.query('submission', query).then((data: any) => {
      this.queuedModel = {
        submissions: data,
        meta: data.meta,
      };
    });
  }
}
