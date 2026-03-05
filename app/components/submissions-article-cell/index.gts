import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
  };
}

// prettier-ignore
<template>
  {{#if (get @record 'publication')}}
    <LinkTo @route='submissions.detail' @model={{@record.id}} class='moo'>
      {{get @record 'publication.title'}}
    </LinkTo>
  {{/if}}
</template> satisfies TemplateOnlyComponent<Signature>
