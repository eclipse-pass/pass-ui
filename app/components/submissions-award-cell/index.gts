import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
  };
}

// prettier-ignore
<template>
  {{#each @record.grants as |grant index|}}
    {{#if index}}
      <span>,</span><br />
    {{/if}}
    <LinkTo @route='grants.detail' @model={{grant.id}}>{{grant.awardNumber}}</LinkTo>
    ({{grant.primaryFunder.name}})
  {{else}}
    Not Available
  {{/each}}
</template> satisfies TemplateOnlyComponent<Signature>
