import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: { grant: GrantModel; submissions: SubmissionModel[] };
    column: { propertyName?: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template>{{@record.grant.pi.displayName}}</template> satisfies TemplateOnlyComponent<Signature>
