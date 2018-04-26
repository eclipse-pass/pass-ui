import DS from 'ember-data';

export default DS.Model.extend({
  depositStatus: DS.attr('string'),
  repoCopy: DS.belongsTo('repo-copy'),
  submission: DS.belongsTo('submission'),
  repository: DS.belongsTo('repository'),
});
