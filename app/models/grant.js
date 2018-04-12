import DS from 'ember-data';

export default DS.Model.extend({
  awardNumber: DS.attr('string'),
  status: DS.attr('string'),
  externalId: DS.attr('string'),
  projectName: DS.attr('string'),
  awardDate: DS.attr('date'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  
  funder: DS.belongsTo('funder'),
  submissions: DS.hasMany('submission', { async: true })
});
