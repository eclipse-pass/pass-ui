import DS from 'ember-data';

export default DS.Model.extend({
  externalIds: DS.attr('set'),
  accessUrl: DS.attr('string'),
  copyStatus: DS.attr('string'),
  publication: DS.belongsTo('publication'),
  repository: DS.belongsTo('repository'),
});
