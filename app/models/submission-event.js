import DS from 'ember-data';

export default DS.Model.extend({
  eventType: DS.attr('string'),
  performedDate: DS.attr('date'),
  performedBy: DS.belongsTo('user'),
  performerRole: DS.attr('string'),
  submission: DS.belongsTo('submission'),
  comment: DS.attr('string'),
  link: DS.attr('string')
});
