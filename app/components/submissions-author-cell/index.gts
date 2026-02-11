import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { get, concat } from '@ember/helper';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
    column: { propertyName?: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template>
  <a href='javascript:;' title='Click to contact corresponding author'>
    {{! @glint-expect-error - get with dynamic path returns unknown }}
    {{get @record (concat @column.propertyName '.displayName')}}
  </a>
</template> satisfies TemplateOnlyComponent<Signature>
