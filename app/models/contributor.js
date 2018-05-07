import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  middleName: DS.attr('string'),
  lastName: DS.attr('string'),
  displayName: DS.attr('string'),
  email: DS.attr('string'),
  orcId: DS.attr('string'),
  affiliation: DS.attr('string'),
  role: DS.attr('set'),
  publication: DS.belongsTo('publication'),
  user: DS.belongsTo('user'),
});
