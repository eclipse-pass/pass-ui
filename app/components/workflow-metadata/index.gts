import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import { LinkTo } from '@ember/routing';
import MetadataForm from 'pass-ui/components/metadata-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  (task: any) =>
  (...args: any[]) =>
    task.perform(...args);

export default class WorkflowMetadata extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare currentUser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare metadataSchema: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare doi: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked metadata: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked schema: any = null;
  @tracked missingRequiredJournal = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked surveyInstance: any = null;

  constructor(...args: any[]) {
    super(...args);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.metadata = JSON.parse((this.args as any).submission.metadata);
    } catch (e) {
      console.log('Error: Submission metadata invalid');
      this.metadata = {};
    }
  }

  @task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupSchema = function* (this: any) {
    if (!this.schema) {
      const repositories = yield this.args.submission.repositories;
      this.schema = this.metadataSchema.getMetadataSchema(repositories, this.workflow.getReadOnlyProperties());

      const requiresJournal =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.schema.elements.findIndex(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el: any) => el.name === 'journal-title' && 'isRequired' in el && el.isRequired,
        ) !== -1;
      const journal = yield this.args.publication.journal;
      this.missingRequiredJournal = requiresJournal && !journal;
    }
  };

  @action
  back() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).back();
  }

  @action
  cancel() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).abort();
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next(newMetadata: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = (this.args as any).submission;

    newMetadata.agent_information = this.getBrowserInfo();
    submission.metadata = JSON.stringify(newMetadata);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).next();
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSurveyReady(survey: any) {
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
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE ', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    //  eslint-disable-next-line
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
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
