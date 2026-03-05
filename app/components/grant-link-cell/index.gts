import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: { grant: GrantModel; submissions: SubmissionModel[] };
    value: unknown;
  };
}

// prettier-ignore
<template>
  <LinkTo @route='grants.detail' @model={{@record.grant.id}} class='award-number'>
    {{@value}}
  </LinkTo>
</template> satisfies TemplateOnlyComponent<Signature>
