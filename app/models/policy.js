import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),

  repository: DS.belongsTo('repository'),
  funder: DS.hasMany('funder'),
});
