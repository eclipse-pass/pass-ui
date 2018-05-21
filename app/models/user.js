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
  orcidId: DS.attr('string'),
  affiliation: DS.attr('string'),
  /** Possible values: admin, submitter */
  roles: DS.attr('set'),

  isSubmitter: Ember.computed('roles', function () {
    return this.get('roles').includes('submitter');
  }),
  isAdmin: Ember.computed('roles', function () {
    return this.get('roles').includes('admin');
  })
});
