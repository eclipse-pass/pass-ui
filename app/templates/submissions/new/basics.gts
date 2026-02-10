import RouteTemplate from 'ember-route-template';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowBasics from 'pass-ui/components/workflow-basics';

// prettier-ignore
export default RouteTemplate(
  <template>
    <WorkflowWrapper
      @submission={{@controller.submission}}
      @publication={{@controller.publication}}
      @submissionEvents={{@controller.submissionEvents}}
      @loadTab={{@controller.validateAndLoadTab}}
      @updateCovidSubmission={{@controller.updateCovidSubmission}}
    >
      <WorkflowBasics
        @submission={{@controller.submission}}
        @publication={{@controller.publication}}
        @preLoadedGrant={{@controller.preLoadedGrant}}
        @journal={{@controller.journal}}
        @flaggedFields={{@controller.flaggedFields}}
        @validateTitle={{@controller.validateTitle}}
        @validateJournal={{@controller.validateJournal}}
        @validateSubmitterEmail={{@controller.validateSubmitterEmail}}
        @updatePublication={{@controller.updatePublication}}
        @validateAndLoadTab={{@controller.validateAndLoadTab}}
        @abort={{@controller.abort}}
      />
    </WorkflowWrapper>
  </template>,
);
