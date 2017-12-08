import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),

  /* The OA repository required by this funder.
   *  
   * TODO: Model this properly.  In reality, a funder
   * should link to a _policy_, and repositories should
   * be specified there.  For the 12/2017 demo, 'repo' will
   * stand in for policy.
   * 
   * PMC, NIHMS, DOE-PAGES
   */
  repo: DS.attr('string')
});
