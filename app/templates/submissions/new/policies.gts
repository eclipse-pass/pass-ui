import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewPolicies from 'pass-ui/controllers/submissions/new/policies';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowPolicies from 'pass-ui/components/workflow-policies';

interface Signature {
  Args: {
    controller: SubmissionsNewPolicies;
  };
}

// prettier-ignore
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
</template> satisfies TemplateOnlyComponent<Signature>
