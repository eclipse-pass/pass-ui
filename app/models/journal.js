/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class JournalModel extends Model {
  /**
   * Name of the journal (REQUIRED)
   */
  @attr('string') journalName;
  @attr('string') nlmta;
  @attr('string') pmcParticipation;
  @attr('set') issns;

  @computed('pmcParticipation')
  get isMethodA() {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.A : false;
  }

  @computed('pmcParticipation')
  get isMethodB() {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.B : false;
  }
}
