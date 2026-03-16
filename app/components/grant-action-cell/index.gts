import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import type GrantModel from 'pass-ui/models/grant';
import type SubmissionModel from 'pass-ui/models/submission';

interface Signature {
  Args: {
    record: { grant: GrantModel; submissions: SubmissionModel[] };
  };
  Blocks: {
    default: [];
  };
}

// prettier-ignore
<template>
  <LinkTo
    @route='submissions.new'
    @query={{hash grant=@record.grant.id submission=null}}
    class='btn btn-outline-primary text-nowrap'
  >New submission</LinkTo>
  {{yield}}
</template> satisfies TemplateOnlyComponent<Signature>
