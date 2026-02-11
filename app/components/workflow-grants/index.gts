import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import didUpdate from '@ember/render-modifiers/modifiers/did-update';
import ModelsTable from 'ember-models-table/components/models-table';
import SubmissionFundingTable from 'pass-ui/components/submission-funding-table';
import GrantLinkNewtabCell from 'pass-ui/components/grant-link-newtab-cell';
import SelectRowToggle from 'pass-ui/components/select-row-toggle';
import DateCell from 'pass-ui/components/date-cell';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type Workflow from 'pass-ui/services/workflow';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

const gt = (a: unknown, b: unknown) => Number(a) > Number(b);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  (task: any) =>
  (...args: any[]) =>
    task.perform(...args);

interface WorkflowGrantsSignature {
  Args: {
    submission: SubmissionModel;
    preLoadedGrant: GrantModel | null;
    next: () => void;
    back: () => void;
    abort: () => void;
  };
  Blocks: {
    default: [];
  };
}

export default class WorkflowGrants extends Component<WorkflowGrantsSignature> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  @service declare workflow: Workflow;
  @service declare appStaticConfig: AppStaticConfigService;
  @service('emt-themes/bootstrap4')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare themeInstance: any;

  @tracked contactUrl: string | null = null;
  @tracked workflowStep = 2;

  @tracked pageNumber = 1;
  @tracked pageCount = 0;
  @tracked pageSize = 10;
  @tracked submitterGrants: GrantModel[] = [];
  @tracked totalGrants = 0;
  @tracked _selectedGrants: GrantModel[] = [];
  @tracked preLoadedGrant: GrantModel | null = this.args.preLoadedGrant;
  @tracked grantColumns = [
    {
      propertyName: 'awardNumber',
      title: 'Award Number',
      className: 'awardnum-column',
      component: 'grantLinkNewtabCell',
      disableSorting: true,
    },
    {
      propertyName: 'projectName',
      title: 'Project Name',
      className: 'projectname-column',
      disableSorting: true,
    },
    {
      propertyName: 'startDate',
      title: 'Start',
      className: 'date-column',
      component: 'dateCell',
      disableSorting: true,
    },
    {
      propertyName: 'endDate',
      title: 'End',
      className: 'date-column',
      component: 'dateCell',
      disableSorting: true,
    },
    {
      propertyName: 'awardStatus',
      title: 'Status',
      disableSorting: true,
    },
    {
      propertyName: 'primaryFunder.name',
      title: 'Funder',
      className: 'funder-column',
      disableSorting: true,
    },
    {
      title: 'Select',
      component: 'selectRowToggle',
      mayBeHidden: false,
    },
  ];

  get pageFirstMatchNumber(): number {
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get pageLastMatchNumber(): number {
    let result = this.pageNumber * this.pageSize;
    const total = this.totalGrants;

    if (result > total) {
      result = total;
    }

    return result;
  }

  @action
  setWorkflowStepHere() {
    this.workflow.setMaxStep(this.workflowStep);
  }

  setup = task(async () => {
    this.contactUrl = this.appStaticConfig?.config?.branding?.pages?.['contactUrl'] ?? null;

    const submitter = await this.args.submission.submitter;
    if (submitter?.id) {
      await this.updateGrants.perform();
    }

    this._selectedGrants = [];
    let grants = await this.args.submission.grants;
    if (this.preLoadedGrant) {
      grants = [this.preLoadedGrant, ...grants];
      this.workflow.addGrant(this.preLoadedGrant);
    }
    this._selectedGrants = [...grants];
  });

  updateGrants = task(async () => {
    const userId = await this.args.submission.submitter.id;
    const grantQuery = {
      filter: {
        grant: `pi.id==${userId},coPis.id==${userId}`,
      },
      sort: '-endDate',
      page: {
        number: this.pageNumber,
        size: this.pageSize,
        totals: true,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await this.store.query('grant', grantQuery).then((data: any) => ({
      grants: data,
      page: data.meta.page,
    }));
    this.submitterGrants = results.grants;
    this.totalGrants = results.page.totalRecords;
    this.pageCount = results.page.totalPages;
  });

  initialAddGrant = task(async (grant: GrantModel | null, event?: Event) => {
    if (grant) {
      this.addGrant(grant);
    } else if (event && (event.target as HTMLSelectElement).value) {
      let grant = await this.store.findRecord('grant', (event.target as HTMLSelectElement).value);

      grant.get('primaryFunder.policy');
      this.addGrant(grant);
      document.querySelectorAll('select')[0]!.selectedIndex = 0;
    }
  });

  @action
  prevPage() {
    const i = this.pageNumber;

    if (i > 1) {
      this.pageNumber = i - 1;
      this.updateGrants.perform();
    }
  }

  @action
  nextPage() {
    const i = this.pageNumber;

    if (i < this.pageCount) {
      this.pageNumber = i + 1;
      this.updateGrants.perform();
    }
  }

  @action
  async addGrant(grant: GrantModel) {
    const workflow = this.workflow;
    const submission = this.args.submission;
    const grants = await submission.grants;

    if (!grants.includes(grant)) {
      this.args.submission.grants = [grant, ...grants];
    }
    if (!workflow.getAddedGrants().includes(grant)) {
      workflow.addGrant(grant);
    }
    if (!this._selectedGrants.includes(grant)) {
      this._selectedGrants = [grant, ...this._selectedGrants];
    }

    this.setWorkflowStepHere();
  }

  @action
  async removeGrant(grant: GrantModel) {
    const workflow = this.workflow;

    if (grant === this.preLoadedGrant) {
      this.preLoadedGrant = null;
    }
    const submission = this.args.submission;
    const grants = await submission.grants;
    this.args.submission.grants = grants.filter((g: GrantModel) => g !== grant);
    workflow.removeGrant(grant);
    this._selectedGrants = this._selectedGrants.filter((g: GrantModel) => g !== grant);

    this.setWorkflowStepHere();
  }

  @action
  dataChange(options: { selectedItems: GrantModel[] }) {
    const selectedItems = options.selectedItems;

    const previousSelection = this._selectedGrants;

    const curLen = selectedItems.length;
    const prevLen = previousSelection.length;

    if (curLen > prevLen) {
      selectedItems
        .filter((grant: GrantModel) => !previousSelection.includes(grant))
        .forEach((grant: GrantModel) => this.addGrant(grant));
    } else if (curLen < prevLen) {
      previousSelection
        .filter((grant: GrantModel) => !selectedItems.includes(grant))
        .forEach((grant: GrantModel) => this.removeGrant(grant));
    } else if (curLen === 1 && prevLen === 1) {
      this.addGrant(selectedItems[0]!);

      return;
    } else if (curLen === 0 && prevLen === 1) {
      this.removeGrant(selectedItems[0]!);
    }
  }

  @action
  abortSubmission() {
    this.args.abort();
  }

  <template>
    {{! template-lint-disable link-href-attributes link-rel-noopener no-invalid-interactive no-invalid-link-text require-button-type }}
    <p
      class='lead text-muted'
      data-test-workflow-grants-lead-text
      {{didInsert (perform this.setup)}}
      {{didUpdate (perform this.setup)}}
    >
      Please select the grant(s)/award(s) that funded this work. This information will help determine which public
      access policies are applicable to your work. If the work you're about to submit was not supported by a grant,
      leave this page blank and go to the next step.
    </p>

    {{#if this._selectedGrants}}
      <h5>
        Grants added to submission
      </h5>
      <SubmissionFundingTable @grants={{this._selectedGrants}} @remove={{this.removeGrant}} @setup={{this.setup}} />
      <button class='btn btn-outline-primary' type='button' {{on 'click' @back}}>
        Back
      </button>
      <button class='btn btn-primary next pull-right' type='button' data-test-workflow-grants-next {{on 'click' @next}}>
        Next
      </button>
      <br />
      <br />
    {{/if}}

    {{#if @submission.submitter.id}}
      <h4>
        Available grants
      </h4>

      <p>
        {{#if this.contactUrl}}
          If your grant is not listed,
          <a href='{{this.contactUrl}}' target='_blank'>
            please contact us
          </a>
          .
        {{/if}}
      </p>

      {{#if (gt this.pageCount '1')}}
        <p class='font-italic'>
          Showing
          {{this.pageFirstMatchNumber}}-{{this.pageLastMatchNumber}}
          of total
          {{this.totalGrants}}
        </p>
      {{/if}}
      {{#if this.setup.isIdle}}
        <div id='grants-selection-table' data-test-grants-selection-table>
          <ModelsTable
            @data={{this.submitterGrants}}
            @columns={{this.grantColumns}}
            @columnComponents={{hash
              grantLinkNewtabCell=(component GrantLinkNewtabCell)
              selectRowToggle=(component SelectRowToggle)
              dateCell=(component DateCell)
            }}
            @themeInstance={{this.themeInstance}}
            @showColumnsDropdown={{false}}
            @useFilteringByColumns={{false}}
            @multipleColumnsSorting={{false}}
            @showComponentFooter={{false}}
            @showGlobalFilter={{false}}
            @pageSize={{this.pageSize}}
            @multipleSelect={{true}}
            @selectedItems={{this._selectedGrants}}
            @onDisplayDataChanged={{this.dataChange}}
            ...attributes
          />
        </div>
      {{else}}
        <div class='d-flex flex-row align-items justify-content-center my-3'>
          <div class='lds-dual-ring mt-0'></div>
        </div>
      {{/if}}

      {{#if (gt this.pageCount '1')}}
        <nav id='grants-selection-nav' aria-label='...'>
          <ul class='pagination justify-content-center'>
            <li class='page-item active btn'>
              {{! template-lint-disable no-invalid-interactive }}
              <a class='fa fa-angle-left' {{on 'click' this.prevPage}}></a>
            </li>
            <li class='page-item d-flex align-items-center'>
              <span>
                Page
                {{this.pageNumber}}
                of
                {{this.pageCount}}
              </span>
            </li>
            <li class='page-item active btn'>
              {{! template-lint-disable no-invalid-interactive }}
              <a class='fa fa-angle-right' {{on 'click' this.nextPage}}></a>
            </li>
          </ul>
        </nav>
      {{/if}}
    {{else}}
      <p data-test-workflow-grants-no-account-message>
        Because the person you are submitting on behalf of is not yet in our system, PASS does not have information
        about his/her grant(s) and cannot associate this submission with a grant. Please click Next to continue.
      </p>
    {{/if}}
    <br />
    <button class='btn btn-outline-primary' type='button' data-test-workflow-grants-back {{on 'click' @back}}>
      Back
    </button>
    <button class='btn btn-outline-danger ml-2' type='button' {{on 'click' this.abortSubmission}}>
      Cancel
    </button>
    <button class='btn btn-primary next pull-right' type='button' data-test-workflow-grants-next {{on 'click' @next}}>
      Next
    </button>
    {{yield}}
  </template>
}
