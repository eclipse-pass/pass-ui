import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  url: DS.attr('string'),
  localKey: DS.attr('string'),

  policy: DS.belongsTo('policy'),
});
