import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewFiles from 'pass-ui/controllers/submissions/new/files';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowFiles from 'pass-ui/components/workflow-files';

interface Signature {
  Args: {
    controller: SubmissionsNewFiles;
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
    <WorkflowFiles
      @submission={{@controller.submission}}
      @next={{@controller.loadNext}}
      @back={{@controller.loadPrevious}}
      @abort={{@controller.abort}}
      @doi={{@controller.publication.doi}}
    />
  </WorkflowWrapper>
</template> satisfies TemplateOnlyComponent<Signature>
