import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';

<template>
  {{#if (get @record 'publication')}}
    <LinkTo @route='submissions.detail' @model={{@record.id}} class='moo'>
      {{get @record 'publication.title'}}
    </LinkTo>
  {{/if}}
</template>
