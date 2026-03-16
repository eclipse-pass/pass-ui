import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import formatDate from 'pass-ui/helpers/format-date';

interface CommentingBlockSignature {
  Args: {
    submissionEvents: SubmissionEventModel[];
  };
}

// prettier-ignore
<template>
  {{#if @submissionEvents}}
    {{#each @submissionEvents as |submissionEvent|}}
      {{#if submissionEvent.comment}}
        <div class='comment my-2 row'>
          <div class='comment-content col-12'>
            <p class='comment-meta'>
              <span class='lead'>
                <a href='mailto:{{submissionEvent.performedBy.email}}'>
                  {{submissionEvent.performedBy.displayName}}
                </a>
              </span>
              <span class='text-muted'>
                ({{formatDate submissionEvent.performedDate}})
              </span>
            </p>
            <div class='comment-body'>
              <p>
                {{submissionEvent.comment}}<br />
              </p>
            </div>
          </div>
        </div>
      {{/if}}
    {{/each}}
  {{/if}}
</template> satisfies TemplateOnlyComponent<CommentingBlockSignature>
