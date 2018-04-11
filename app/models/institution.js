import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  appName: DS.attr('string'),
  primaryColor: DS.attr('string'),
  secondaryColor: DS.attr('string'),
  tertiaryColor: DS.attr('string'),
  logo: DS.attr('string'),
  schema: DS.attr('string')
});
