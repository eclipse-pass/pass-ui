import DS from 'ember-data';

export default DS.Model.extend({
  file: DS.attr(),
  description: DS.attr('string'),
});
