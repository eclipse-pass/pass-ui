import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import SubmissionFundingTable from 'pass-ui/components/submission-funding-table';
import GrantLinkNewtabCell from 'pass-ui/components/grant-link-newtab-cell';
import DateCell from 'pass-ui/components/date-cell';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { query, findRecord } from 'pass-ui/builders/pass-api';
import type Owner from '@ember/owner';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';
import type Workflow from 'pass-ui/services/workflow';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

const gt = (a: unknown, b: unknown) => Number(a) > Number(b);
const includes = (arr: unknown[], item: unknown) => arr.includes(item);

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

  constructor(owner: Owner, args: WorkflowGrantsSignature['Args']) {
    super(owner, args);
    this.setup.perform();
  }

  @tracked contactUrl: string | null = null;
  @tracked workflowStep = 2;

  @tracked pageNumber = 1;
  @tracked pageCount = 0;
  @tracked pageSize = 10;
  @tracked submitterGrants: GrantModel[] = [];
  @tracked totalGrants = 0;
  @tracked _selectedGrants: GrantModel[] = [];
  @tracked preLoadedGrant: GrantModel | null = this.args.preLoadedGrant;

  get hasPrevPage(): boolean {
    return this.pageNumber > 1;
  }

  get hasNextPage(): boolean {
    return this.pageNumber < this.pageCount;
  }

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

    const submitter = this.args.submission.submitter;
    if (submitter?.id) {
      await this.updateGrants.perform();
    }

    this._selectedGrants = [];
    let grants = this.args.submission.grants;
    if (this.preLoadedGrant) {
      grants = [this.preLoadedGrant, ...grants];
      this.workflow.addGrant(this.preLoadedGrant);
    }
    this._selectedGrants = [...grants];
  });

  updateGrants = task(async () => {
    const userId = this.args.submission.submitter.id;
    const grantQuery = {
      include: 'primaryFunder,directFunder',
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
    const { content } = await this.store.request(query('grant', grantQuery));
    const data = content.data;
    const meta = content.meta;
    this.submitterGrants = data;
    this.totalGrants = meta.page.totalRecords;
    this.pageCount = meta.page.totalPages;
  });

  initialAddGrant = task(async (grant: GrantModel | null, event?: Event) => {
    if (grant) {
      this.addGrant(grant);
    } else if (event && (event.target as HTMLSelectElement).value) {
      const { content: grantDoc } = await this.store.request(
        findRecord('grant', (event.target as HTMLSelectElement).value, { include: 'primaryFunder,directFunder' }),
      );

      this.addGrant(grantDoc.data);
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
  addGrant(grant: GrantModel) {
    const workflow = this.workflow;
    const submission = this.args.submission;
    const grants = submission.grants;

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
  removeGrant(grant: GrantModel) {
    const workflow = this.workflow;

    if (grant === this.preLoadedGrant) {
      this.preLoadedGrant = null;
    }
    const submission = this.args.submission;
    const grants = submission.grants;
    this.args.submission.grants = grants.filter((g: GrantModel) => g !== grant);
    workflow.removeGrant(grant);
    this._selectedGrants = this._selectedGrants.filter((g: GrantModel) => g !== grant);

    this.setWorkflowStepHere();
  }

  @action
  toggleGrantFromButton(grant: GrantModel, event: Event) {
    event.stopPropagation();
    this.toggleGrant(grant);
  }

  @action
  toggleGrant(grant: GrantModel) {
    if (this._selectedGrants.includes(grant)) {
      this.removeGrant(grant);
    } else {
      this.addGrant(grant);
    }
  }

  @action
  abortSubmission() {
    this.args.abort();
  }

  <template>
    {{! template-lint-disable link-href-attributes link-rel-noopener no-invalid-interactive no-invalid-link-text require-button-type }}
    <p class='lead text-muted' data-test-workflow-grants-lead-text>
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
          <table class='table table-striped table-sm'>
            <thead>
              <tr>
                <th class='awardnum-column'>Award Number</th>
                <th class='projectname-column'>Project Name</th>
                <th class='date-column'>Start</th>
                <th class='date-column'>End</th>
                <th>Status</th>
                <th class='funder-column'>Funder</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {{! template-lint-disable no-invalid-interactive }}
              {{#each this.submitterGrants as |grant|}}
                <tr {{on 'click' (fn this.toggleGrant grant)}}>
                  <td class='awardnum-column'>
                    <GrantLinkNewtabCell @record={{grant}} @value={{grant.awardNumber}} />
                  </td>
                  <td class='projectname-column'>{{grant.projectName}}</td>
                  <td class='date-column'><DateCell @value={{grant.startDate}} /></td>
                  <td class='date-column'><DateCell @value={{grant.endDate}} /></td>
                  <td>{{grant.awardStatus}}</td>
                  <td class='funder-column'>{{grant.primaryFunder.name}}</td>
                  <td>
                    <button type='button' class='grant-select-btn' {{on 'click' (fn this.toggleGrantFromButton grant)}}>
                      {{#if (includes this._selectedGrants grant)}}
                        <FaIcon @icon='square-check' @prefix='far' />
                      {{else}}
                        <FaIcon @icon='square' @prefix='far' />
                      {{/if}}
                    </button>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      {{else}}
        <div class='d-flex flex-row align-items justify-content-center my-3'>
          <div class='lds-dual-ring mt-0'></div>
        </div>
      {{/if}}

      {{#if (gt this.pageCount '1')}}
        <nav id='grants-selection-nav' aria-label='Grant pagination'>
          <ul class='pagination justify-content-center'>
            <li class='page-item'>
              <button
                type='button'
                class='page-link'
                disabled={{if this.hasPrevPage false true}}
                {{on 'click' this.prevPage}}
              >
                <FaIcon @icon='angle-left' />
              </button>
            </li>
            <li class='page-item d-flex align-items-center px-3'>
              <span>
                Page
                {{this.pageNumber}}
                of
                {{this.pageCount}}
              </span>
            </li>
            <li class='page-item'>
              <button
                type='button'
                class='page-link'
                disabled={{if this.hasNextPage false true}}
                {{on 'click' this.nextPage}}
              >
                <FaIcon @icon='angle-right' />
              </button>
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
