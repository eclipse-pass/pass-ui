import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  policyUrl: DS.attr('string'),

  repositories: DS.hasMany('repository'),
  institution: DS.attr('string'),
  // funder: DS.hasMany('funder'),
});
