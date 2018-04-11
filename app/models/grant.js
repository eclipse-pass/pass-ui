import DS from 'ember-data';

export default DS.Model.extend({
  awardNumber: DS.attr('string'),
  status: DS.attr('string'),
  externalId: DS.attr('string'),
  projectName: DS.attr('string'),
  funder: DS.belongsTo('funder'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  // externalId: DS.belongsTo('identifier'),
  // oapCompliance: DS.attr('string'),
  // creator: DS.belongsTo('user'),
  // creationDate: DS.attr('date'),
  // pi: DS.belongsTo('person'),
  // copis: DS.hasMany('person', { async: true }),
  submissions: DS.hasMany('submission', { async: true })
});
