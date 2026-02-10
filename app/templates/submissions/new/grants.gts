import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowGrants from 'pass-ui/components/workflow-grants';

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
      <WorkflowGrants
        @submission={{@controller.submission}}
        @preLoadedGrant={{@controller.preLoadedGrant}}
        @next={{@controller.loadNext}}
        @back={{@controller.loadPrevious}}
        @abort={{@controller.abort}}
      />
    </WorkflowWrapper>
  </template>,
);
