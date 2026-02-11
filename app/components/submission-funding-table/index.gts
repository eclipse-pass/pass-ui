import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import formatDate from 'pass-ui/helpers/format-date';
import type GrantModel from 'pass-ui/models/grant';

interface Signature {
  Args: {
    grants: GrantModel[];
    remove?: (grant: GrantModel) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup?: any;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queue =
  (...fns: Array<(...args: any[]) => void>) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]) =>
    fns.forEach((f) => f(...args));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform = (task: any) => () => task.perform();

// prettier-ignore
<template>
  <table class='table' data-test-submission-funding-table>
    <thead>
      <tr>
        <th>Award Number</th>
        <th>Project name (funding period)</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {{#each @grants as |grant|}}
        <tr class='pr-0'>
          <td class='awardnum-column'>
            <LinkTo
              @route='grants.detail'
              @model={{grant}}
              class='text-nowrap'
              target='_blank'
              rel='noopener noreferrer'
            >{{grant.awardNumber}}</LinkTo>
          </td>
          <td class='projectname-date-column'>{{grant.projectName}}
            ({{formatDate grant.startDate}}
            -
            {{formatDate grant.endDate}})</td>
          <td class='pr-0 mr-0'>
            {{#if @remove}}
              <button
                type='button'
                class='btn btn-outline-danger pull-right'
                {{on 'click' (queue (fn @remove grant) (perform @setup))}}
              >Remove</button>
            {{/if}}
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</template> satisfies TemplateOnlyComponent<Signature>
