import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),
  formSchema: DS.attr('string'),
  weblinkOnly: Ember.computed('name', function () {
    return this.get('name');
  }),

  // policy: DS.belongsTo('policy'),
  // submissions: DS.hasMany('submission', { async: true }),
});
