import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * Name of the journal (REQUIRED)
   */
  name: DS.attr('string'),
  nlmta: DS.attr('string'),
  pmcParticipation: DS.attr('string'/* , { defaultValue: 'B' } */), // default value for debugging pmc mechanism
  isMethodA: Ember.computed('pmcParticipation', function () {
    return this.get('pmcParticipation') ? this.get('pmcParticipation').toLowerCase() === 'a' : false;
  }),
  isMethodB: Ember.computed('pmcParticipation', function () {
    return this.get('pmcParticipation') ? this.get('pmcParticipation').toLowerCase() === 'b' : false;
  })
  // issns: ...     Need to support array of strings in fedora-adapter
});
