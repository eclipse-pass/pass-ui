import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  email: DS.attr('string'),
  isStaff: DS.attr('boolean'),
  isActive: DS.attr('boolean'),
  isSuperuser: DS.attr('boolean'),
  isAnonymous: DS.attr('boolean'),
  dateJoined: DS.attr('date'),

  person: DS.belongsTo('person'),
});
