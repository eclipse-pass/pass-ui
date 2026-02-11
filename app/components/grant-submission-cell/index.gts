import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: { grant: GrantModel; submissions: SubmissionModel[] };
    column: { propertyName?: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template>
  <LinkTo @route='grants.detail' @model={{get @record 'grant.id'}}>
    {{! @glint-expect-error - get with dynamic propertyName returns unknown }}
    {{get @record @column.propertyName}}
  </LinkTo>
</template> satisfies TemplateOnlyComponent<Signature>
