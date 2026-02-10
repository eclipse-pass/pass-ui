import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';

<template>
  <LinkTo @route='grants.detail' @model={{@record.grant.id}} class='award-number'>
    {{get @record @column.propertyName}}
  </LinkTo>
</template>
