import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  url: DS.attr('string'),
  policy: DS.belongsTo('policy'),
  localId: DS.attr('string'),
  // TODO temp support for old style until 'policy' is better modeled
  repo: DS.attr('string')
});
