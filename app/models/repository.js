import DS from 'ember-data';

export default DS.Model.extend({
  /** Name of repository e.g. PubMed Central (REQUIRED) */
  name: DS.attr('string'),
  /** Human readable description of the repository */
  description: DS.attr('string'),
  /** URL to homepage of the repository  */
  url: DS.attr('string')
});
