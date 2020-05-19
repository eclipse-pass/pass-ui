import Model, { attr } from '@ember-data/model';

export default class PublisherModel extends Model {
  /** Name of the publisher (REQUIRED) */
  @attr('string') name;
  /**
   * Publisher participation in NIH Public Access Program by sending final published article to PMC.
   *
   * Possible values:
   *   - A (Route A: journal automatically post paper to PMC)
   *   - B (Route B: authors must make special arrangements for some journals and publishers to post the paper directly to PMC)
   *   - C (Route C: authors or deignee must submit manuscripts to NIHMS)
   *   - D (Route D: some publishers will submit manuscripts to NIHMS)
   */
  @attr('string') pmcParticipation;
}
