import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewRepositories from 'pass-ui/controllers/submissions/new/repositories';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowRepositories from 'pass-ui/components/workflow-repositories';

interface Signature {
  Args: {
    controller: SubmissionsNewRepositories;
  };
}

// prettier-ignore
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
</template> satisfies TemplateOnlyComponent<Signature>
