import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import { LinkTo } from '@ember/routing';
import MetadataForm from 'pass-ui/components/metadata-form';
import type Workflow from 'pass-ui/services/workflow';
import type CurrentUserService from 'pass-ui/services/current-user';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';
import type { SurveySchema, SurveyElement } from 'pass-ui/services/metadata-schema';
import type DoiService from 'pass-ui/services/doi';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type RepositoryModel from 'pass-ui/models/repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (task: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) =>
      task.perform(...args);

interface SurveyInstance {
  tryComplete(): void;
  data: Record<string, unknown>;
}

interface WorkflowMetadataSignature {
  Args: {
    submission: SubmissionModel;
    publication: PublicationModel;
    repositories: RepositoryModel[];
    next: () => void;
    back: () => void;
    abort: () => void;
  };
  Blocks: {
    default: [];
  };
}

export default class WorkflowMetadata extends Component<WorkflowMetadataSignature> {
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  @service declare workflow: Workflow;
  @service declare metadataSchema: MetadataSchemaService;
  @service declare doi: DoiService;

  @tracked metadata: Record<string, unknown> = {};
  @tracked schema: SurveySchema | null = null;
  @tracked missingRequiredJournal = false;
  @tracked surveyInstance: SurveyInstance | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(owner: any, args: WorkflowMetadataSignature['Args']) {
    super(owner, args);

    try {
      this.metadata = JSON.parse(this.args.submission.metadata);
    } catch (e) {
      console.log('Error: Submission metadata invalid');
      this.metadata = {};
    }
  }

  setupSchema = task(async () => {
    if (!this.schema) {
      const repositories = this.args.submission.repositories;
      this.schema = this.metadataSchema.getMetadataSchema(repositories, this.workflow.getReadOnlyProperties());

      const requiresJournal =
        this.schema!.elements.findIndex(
          (el: SurveyElement) => el.name === 'journal-title' && 'isRequired' in el && el.isRequired,
        ) !== -1;
      const journal = this.args.publication.journal;
      this.missingRequiredJournal = requiresJournal && !journal;
    }
  });

  @action
  back() {
    this.args.back();
  }

  @action
  cancel() {
    this.args.abort();
  }

  @action
  next(newMetadata: Record<string, unknown>) {
    const submission = this.args.submission;

    newMetadata['agent_information'] = this.getBrowserInfo();
    submission.metadata = JSON.stringify(newMetadata);

    this.args.next();
  }

  @action
  onSurveyReady(survey: SurveyInstance) {
    this.surveyInstance = survey;
  }

  @action
  handleExternalSubmit() {
    if (this.surveyInstance) {
      this.surveyInstance.tryComplete();
    }
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let tem;
    let M: string[] = (ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []) as string[];
    if (/trident/i.test(M[1]!)) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE ', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [M[1]!, M[2]!] : [navigator.appName, navigator.appVersion, '-?'];
    //  eslint-disable-next-line
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]!);
    }
    return {
      name: M[0],
      version: M[1],
    };
  }

  <template>
    <div {{didInsert (perform this.setupSchema)}}>

      {{#if this.missingRequiredJournal}}
        <h2>Missing required journal</h2>
        <p>
          A repository requires information about the journal associated with the submission. Please
          <LinkTo @route='submissions.new.basics'>go back and enter a journal</LinkTo>.
        </p>
      {{else}}
        {{#if this.schema}}
          <MetadataForm
            @schema={{this.schema}}
            @data={{this.metadata}}
            @next={{this.next}}
            @onSurveyReady={{this.onSurveyReady}}
          />
        {{/if}}
      {{/if}}
    </div>

    {{yield}}

    <button class='btn btn-outline-primary' data-test-workflow-metadata-back type='button' {{on 'click' this.back}}>
      Back
    </button>
    <button
      class='btn btn-outline-danger ml-2'
      data-test-workflow-metadata-cancel
      type='button'
      {{on 'click' this.cancel}}
    >
      Cancel
    </button>
    <button
      class='btn btn-primary next pull-right'
      data-test-workflow-metadata-next
      type='button'
      {{on 'click' this.handleExternalSubmit}}
    >
      Next
    </button>
  </template>
}
