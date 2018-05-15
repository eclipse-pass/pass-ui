import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  repositories: hasMany('repository'),
  funders: hasMany('funder')
});
