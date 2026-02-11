import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { get } from '@ember/helper';
import formatDate from 'pass-ui/helpers/format-date';

interface Signature {
  Args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    record: any;
    column: { propertyName: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template>{{! @glint-ignore - get with dynamic propertyName returns unknown }}{{formatDate (get @record @column.propertyName)}}</template> satisfies TemplateOnlyComponent<Signature>
