import DS from 'ember-data';

export default DS.Model.extend({
  eventType: DS.attr('string'),
  performedDate: DS.attr('date'),
  performerRole: DS.attr('string'),
  comment: DS.attr('string'),
  link: DS.attr('string'),
  submission: DS.belongsTo('submission'),
  performedBy: DS.belongsTo('user'),
});
