import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
  };
}

// prettier-ignore
<template>
  {{#each @record.repositories as |repo index|}}
    {{if index ', '}}
    {{#if repo.name}}
      {{repo.name}}
    {{/if}}
  {{else}}
    Not Available
  {{/each}}
</template> satisfies TemplateOnlyComponent<Signature>
