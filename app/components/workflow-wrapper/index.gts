import Component from '@glimmer/component';
import { action } from '@ember/object';
import SubmissionNav from 'pass-ui/components/submission-nav';
import CommentingBlock from 'pass-ui/components/commenting-block';

const and = (...args: unknown[]) => args.every(Boolean);

export default class WorkflowWrapper extends Component {
  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadTab(gotoRoute: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.args as any).loadTab(gotoRoute);
  }

  <template>
    {{! template-lint-disable no-inline-styles }}
    <div id='submission-workflow-container'>
      <div class='block-user-input text-center'>
        <div class='lds-dual-ring mx-auto'></div>
      </div>
      <div class='row justify-content-center mb-2'>
        <h2 class='font-weight-light col-12 mb-0'>
          New Submission
        </h2>
        <div class='font-weight-light col-12 publication-title'>
          {{@publication.title}}
        </div>
      </div>
      <div class='row'>
        <SubmissionNav
          @loadTab={{this.loadTab}}
          @updateCovidSubmission={{@updateCovidSubmission}}
          @submission={{@submission}}
        />
      </div>
      <div class='row justify-content-center'>
        <div class='col-lg-12'>
          {{yield}}
        </div>
      </div>

      {{#if (and @submissionEvents @submission.isProxySubmission)}}
        {{#if @submission.id}}
          <div class='alert alert-info mt-3'>
            <h3 class='mt-3 mb-0'>
              Comments
            </h3>
            <hr class='mt-0' />
            <CommentingBlock @submissionEvents={{@submissionEvents}} />
          </div>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
