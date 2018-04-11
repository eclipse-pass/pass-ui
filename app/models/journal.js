import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  issns: DS.hasMany('identifier', {async: true}),
  nlmta: DS.attr('string')
});
