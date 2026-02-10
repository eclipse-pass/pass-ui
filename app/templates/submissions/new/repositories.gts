import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowRepositories from 'pass-ui/components/workflow-repositories';

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
      <WorkflowRepositories
        @submission={{@controller.submission}}
        @requiredRepositories={{@controller.model.requiredRepositories}}
        @optionalRepositories={{@controller.model.optionalRepositories}}
        @choiceRepositories={{@controller.model.choiceRepositories}}
        @next={{@controller.loadNext}}
        @back={{@controller.loadPrevious}}
        @abort={{@controller.abort}}
      />
    </WorkflowWrapper>
  </template>,
);
