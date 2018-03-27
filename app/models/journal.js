import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * Name of the journal (REQUIRED)
   */
  name: DS.attr('string'),
  /**
   * Publisher of the journal
   */
  publisher: DS.attr('string'),
  /**
   * List of journal ISSN's (strings)
   */
  ISSNs: DS.hasMany('identifier', {async: true}),
  /**
   * National Library of Medicine Title Abbreviation
   */
  nlmta: DS.attr('string'),
  /**
   * Indication of journal participation in NIH Public Access Program by sending
   * final published article to PMC (see https://publicaccess.nih.gov/submit_process.htm).
   *
   * Possible values:
   *   - A (Route A: journal automatically post paper to PMC)
   *   - B (Route B: authors must make special arrangements for some journals and publishers to post the paper directly to PMC)
   *   - C (Route C: authors or deignee must submit manuscripts to NIHMS)
   *   - D (Route D: some publishers will submit manuscripts to NIHMS)
   */
  pmcParticipation: DS.attr('string')
});
