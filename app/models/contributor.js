import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  middleName: DS.attr('string'),
  lastName: DS.attr('string'),
  displayName: DS.attr('string'),
  email: DS.attr('string'),
  orcidId: DS.attr('string'),
  affiliation: DS.attr('set'),
  roles: DS.attr('set'),
  publication: DS.belongsTo('publication'),
  user: DS.belongsTo('user'),
});
