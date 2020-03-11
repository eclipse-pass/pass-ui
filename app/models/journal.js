import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * Name of the journal (REQUIRED)
   */
  journalName: DS.attr('string'),
  nlmta: DS.attr('string'),
  pmcParticipation: DS.attr('string'),
  issns: DS.attr('set'),
  publisher: DS.belongsTo('publisher'),

  isMethodA: computed('pmcParticipation', function () {
    return this.get('pmcParticipation') ? this.get('pmcParticipation').toLowerCase() === 'a' : false;
  }),
  isMethodB: computed('pmcParticipation', function () {
    return this.get('pmcParticipation') ? this.get('pmcParticipation').toLowerCase() === 'b' : false;
  })
});
