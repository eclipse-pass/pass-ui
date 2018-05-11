import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  repositories: hasMany('repository'),
  grants: hasMany('grant'),
  user: belongsTo('user'),
  publication: belongsTo('publication')
});
