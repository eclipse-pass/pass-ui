import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  nlmta: DS.attr('string'),
  pmcParticipation: DS.attr('string'),
  // issns: ...     Need to support array of strings in fedora-adapter
});
