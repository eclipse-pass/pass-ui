import DS from 'ember-data';

export default DS.Model.extend({
  externalIds: DS.attr('string'),
  accessUrl: DS.attr('string'),
  status: DS.attr('string'),
  publication: DS.belongsTo('publication'),
  repository: DS.belongsTo('repository'),
});
