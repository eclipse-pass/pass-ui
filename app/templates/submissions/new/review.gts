import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowReview from 'pass-ui/components/workflow-review';

// prettier-ignore
export default RouteTemplate(
  <template>
    <WorkflowWrapper
      @submission={{@controller.submission}}
      @title={{@controller.publication.title}}
      @isProxySubmission={{@controller.submission.isProxySubmission}}
      @submissionEvents={{@controller.submissionEvents}}
      @loadTab={{@controller.loadTab}}
      @updateCovidSubmission={{@controller.updateCovidSubmission}}
    >
      <WorkflowReview
        @submission={{@controller.submission}}
        @publication={{@controller.publication}}
        @comment={{@controller.comment}}
        @back={{@controller.loadPrevious}}
        @submitSubmission={{@controller.submit}}
        @uploading={{@controller.uploading}}
        @waitingMessage={{@controller.waitingMessage}}
        @abort={{@controller.abort}}
      />
    </WorkflowWrapper>
  </template>,
);
