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
} as const;

export default class JournalModel extends Model {
  /**
   * Name of the journal (REQUIRED)
   */
  @attr('string') declare journalName: string;
  @attr('string') declare nlmta: string;
  @attr('string') declare pmcParticipation: string;
  @attr('set') declare issns: string[];

  get isMethodA(): boolean {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.A : false;
  }

  get isMethodB(): boolean {
    return this.pmcParticipation ? this.pmcParticipation === PMCParticipation.B : false;
  }
}
