import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  publisher: DS.belongsTo('publisher'),
  ISSNs: DS.hasMany('identifier', {async: true}),
  nlmta: DS.attr('string'),
  pmcParticipation: DS.attr('string')
});
