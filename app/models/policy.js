import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),
  metadata: DS.attr(),

  repository: DS.belongsTo('repository'),
  funder: DS.hasMany('funder'),
});
