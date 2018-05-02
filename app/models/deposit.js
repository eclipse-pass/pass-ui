import DS from 'ember-data';

export default DS.Model.extend({
  depositStatusRef: DS.attr('string'),
  depositStatus: DS.attr('string'),
  repositoryCopy: DS.belongsTo('repository-copy'),
  submission: DS.belongsTo('submission'),
  repository: DS.belongsTo('repository'),
});
