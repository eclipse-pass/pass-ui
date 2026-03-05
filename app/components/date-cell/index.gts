import type { TemplateOnlyComponent } from '@ember/component/template-only';
import formatDate from 'pass-ui/helpers/format-date';

interface Signature {
  Args: {
    value: unknown;
  };
}

// prettier-ignore
<template>{{formatDate @value}}</template> satisfies TemplateOnlyComponent<Signature>
