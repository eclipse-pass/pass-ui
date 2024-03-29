import Model, { attr } from '@ember-data/model';

/**
 * Publisher participation in NIH Public Access Program by sending final published article to PMC.
 *
 * Possible values:
 *   - A (Route A: journal automatically post paper to PMC)
 *   - B (Route B: authors must make special arrangements for some journals and publishers to post the paper directly to PMC)
 *   - C (Route C: authors or designee must submit manuscripts to NIHMS)
 *   - D (Route D: some publishers will submit manuscripts to NIHMS)
 */
const PMCParticipation = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
};

export default class JournalModel extends Model {
  /**
   * Name of the journal (REQUIRED)
   */
  @attr('string') journalName;
  @attr('string') nlmta;
  @attr('string') pmcParticipation;
  @attr('set') issns;

  get isMethodA() {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.A : false;
  }

  get isMethodB() {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.B : false;
  }
}
