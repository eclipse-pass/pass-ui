import { get } from '@ember/helper';
import formatDate from 'pass-ui/helpers/format-date';

<template>{{formatDate (get @record @column.propertyName)}}</template>
