import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewMetadata from 'pass-ui/controllers/submissions/new/metadata';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowMetadata from 'pass-ui/components/workflow-metadata';

interface Signature {
  Args: {
    controller: SubmissionsNewMetadata;
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
    <WorkflowMetadata
      @submission={{@controller.submission}}
      @publication={{@controller.publication}}
      @repositories={{@controller.repositories}}
      @next={{@controller.loadNext}}
      @back={{@controller.loadPrevious}}
      @abort={{@controller.abort}}
    />
  </WorkflowWrapper>
</template> satisfies TemplateOnlyComponent<Signature>
