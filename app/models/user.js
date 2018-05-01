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

  institutionalId: DS.attr('string'),
  orcId: DS.attr('string'),
  affiliation: DS.attr('string'),
  roles: DS.attr('set'),

  /** Not part of the pass-data-model */
  isStaff: DS.attr('boolean'),
  isActive: DS.attr('boolean'),
  isSuperuser: DS.attr('boolean'),
  isAnonymous: DS.attr('boolean'),
  dateJoined: DS.attr('date'),
  shibbolethId: DS.attr('string'),

  submissionDraft: DS.belongsTo('submission'),
});
