import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),
  formSchema: DS.attr('string'),
  integrationType: DS.attr('string'),
  weblinkOnly: Ember.computed('name', function () {
    return this.get('name');
  }),
  agreementText: DS.attr('string', {
    defaultValue: false
  }),
  repositoryKey: DS.attr('string'),

  _selected: DS.attr('boolean')
  // policy: DS.belongsTo('policy'),
  // submissions: DS.hasMany('submission', { async: true }),
});
