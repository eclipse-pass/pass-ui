import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * (Requried)
   */
  username: DS.attr('string'),
  displayName: DS.attr('string'),
  firstName: DS.attr('string'),
  middleName: DS.attr('string'),
  lastName: DS.attr('string'),
  email: DS.attr('string'),
  isStaff: DS.attr('boolean'),
  isActive: DS.attr('boolean'),
  isSuperuser: DS.attr('boolean'),
  isAnonymous: DS.attr('boolean'),
  dateJoined: DS.attr('date'),

  institutionalId: DS.attr('string'),
  orcid: DS.attr('string'),
  affiliation: DS.attr('string'),
  role: DS.attr('string'),
  shibbolethId: DS.attr('string'),

  submissionDraft: DS.belongsTo('submission'),
});
