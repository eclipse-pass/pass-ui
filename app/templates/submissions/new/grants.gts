import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewGrants from 'pass-ui/controllers/submissions/new/grants';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowGrants from 'pass-ui/components/workflow-grants';

interface Signature {
  Args: {
    controller: SubmissionsNewGrants;
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
    <WorkflowGrants
      @submission={{@controller.submission}}
      @preLoadedGrant={{@controller.preLoadedGrant}}
      @next={{@controller.loadNext}}
      @back={{@controller.loadPrevious}}
      @abort={{@controller.abort}}
    />
  </WorkflowWrapper>
</template> satisfies TemplateOnlyComponent<Signature>
