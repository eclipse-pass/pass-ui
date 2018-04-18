import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  middleName: DS.attr('string'),
  lastName: DS.attr('string'),
  displayName: DS.attr('string'),
  emailAddress: DS.attr('string'),
  orcid: DS.attr('string'),
  affiliation: DS.attr('string'),
  role: DS.attr('string'),
  publication: DS.belongsTo('publication'),
  user: DS.belongsTo('user'),
});
