import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';

interface Signature {
  Args: {
    repoCopy?: RepositoryCopyModel;
  };
}

// prettier-ignore
<template>
  <div class='d-flex'>
    <strong class='col-5 px-0'>Manuscript ID(s):</strong>
    {{#if @repoCopy.externalIds}}
      <ul class='col list-unstyled'>
        {{#if @repoCopy.accessUrl}}
          {{#each @repoCopy.externalIds as |externalId|}}
            <li><a href='{{@repoCopy.accessUrl}}' target='_blank' rel='noopener noreferrer'>{{externalId}}</a></li>
          {{/each}}
        {{else}}
          <ul class='col list-unstyled'>
            {{#each @repoCopy.externalIds as |externalId|}}
              <li>{{externalId}}</li>
            {{/each}}
          </ul>
        {{/if}}
      </ul>
    {{else}}
      <span class='col nodata-placeholder'>Manuscript ID(s) are not yet assigned by the repository.</span>
    {{/if}}
  </div>
</template> satisfies TemplateOnlyComponent<Signature>
