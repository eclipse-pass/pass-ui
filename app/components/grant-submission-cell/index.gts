import { get } from '@ember/helper';
import { LinkTo } from '@ember/routing';

<template>
  <LinkTo @route='grants.detail' @model={{get @record 'grant.id'}}>
    {{get @record @column.propertyName}}
  </LinkTo>
</template>
