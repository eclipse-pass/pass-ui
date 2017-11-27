import DS from 'ember-data';

export default DS.Model.extend({
  awardNumber: DS.attr('string'),
  projectName: DS.attr('string'),
  funder: DS.belongsTo('funder'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  externalId: DS.belongsTo('identifier'),
  status: DS.attr('string'),
  oapCompliance: DS.attr('string'),
  creator: DS.belongsTo('user'),
  creationDate: DS.attr('date'),
  pi: DS.belongsTo('person'),
  copis: DS.hasMany('person'),
  submissions: DS.hasMany('submission', { async: true })
});
