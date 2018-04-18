import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),

  policy: DS.belongsTo('policy'),
  submissions: DS.hasMany('submission', {async: true}),
});
