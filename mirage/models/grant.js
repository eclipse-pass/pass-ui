import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  coPis: hasMany('user'),
  pi: belongsTo('user'),
  submissions: hasMany('submission'),
  primaryFunder: belongsTo('funder'),
});
