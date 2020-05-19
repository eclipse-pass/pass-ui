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

  @belongsTo('publisher') publisher;

  @computed('pmcParticipation')
  get isMethodA() {
    return this.pmcParticipation ? this.pmcParticipation.toLowerCase() === 'a' : false;
  }

  @computed('pmcParticipation')
  get isMethodB() {
    return this.pmcParticipation ? this.pmcParticipation.toLowerCase() === 'b' : false;
  }
}
