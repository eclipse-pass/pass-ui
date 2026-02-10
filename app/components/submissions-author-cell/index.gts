import { get, concat } from '@ember/helper';

<template>
  <a href='javascript:;' title='Click to contact corresponding author'>
    {{get @record (concat @column.propertyName '.displayName')}}
  </a>
</template>
