import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
    column: { propertyName?: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template>
  {{#if (get @record 'publication')}}
    <LinkTo @route='submissions.detail' @model={{@record.id}} class='moo'>
      {{! @glint-expect-error - get returns unknown for nested path }}
      {{get @record 'publication.title'}}
    </LinkTo>
  {{/if}}
</template> satisfies TemplateOnlyComponent<Signature>
