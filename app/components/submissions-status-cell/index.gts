import type { TemplateOnlyComponent } from '@ember/component/template-only';
import SubmissionStatus from 'pass-ui/components/submission-status';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: SubmissionModel;
    column: { propertyName?: string; title?: string; className?: string };
  };
}

// prettier-ignore
<template><SubmissionStatus @submissionStatus={{@record.submissionStatus}} /></template> satisfies TemplateOnlyComponent<Signature>
