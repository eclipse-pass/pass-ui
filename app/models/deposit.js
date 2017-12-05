import DS from 'ember-data';

export default DS.Model.extend({
  repo: DS.attr('string'),
  assignedId: DS.belongsTo('identifier'),
  grant: DS.belongsTo('grant'),
  updatedDate: DS.attr('date'),
  status: DS.attr('string')
});
