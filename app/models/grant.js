import DS from 'ember-data';

export default DS.Model.extend({
  number: DS.attr('string'),
  title: DS.attr('string'),
  agency: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  externalId: DS.attr('string'),
  status: DS.attr('string'),
  creator: DS.belongsTo('user'),
  submissions: DS.hasMany('submission', { async: true })
});
