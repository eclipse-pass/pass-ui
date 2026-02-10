import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowPolicies from 'pass-ui/components/workflow-policies';

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
      <WorkflowPolicies
        @submission={{@controller.submission}}
        @policies={{@controller.policies}}
        @publication={{@controller.publication}}
        @next={{@controller.loadNext}}
        @back={{@controller.loadPrevious}}
        @abort={{@controller.abort}}
      />
    </WorkflowWrapper>
  </template>,
);
