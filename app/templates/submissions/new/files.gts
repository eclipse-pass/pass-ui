import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowFiles from 'pass-ui/components/workflow-files';

// prettier-ignore
export default RouteTemplate(
  <template>
    <WorkflowWrapper
      @submission={{@controller.submission}}
      @title={{@controller.publication.title}}
      @isProxySubmission={{@controller.submission.isProxySubmission}}
      @submissionEvents={{@controller.submissionEvents}}
      @loadTab={{@controller.validateAndLoadTab}}
      @updateCovidSubmission={{@controller.updateCovidSubmission}}
    >
      <WorkflowFiles
        @submission={{@controller.submission}}
        @next={{@controller.loadNext}}
        @back={{@controller.loadPrevious}}
        @abort={{@controller.abort}}
        @doi={{@controller.publication.doi}}
      />
    </WorkflowWrapper>
  </template>,
);
