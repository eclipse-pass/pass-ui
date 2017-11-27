import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  label: DS.attr('string'),
  uri: DS.attr('string')
});
