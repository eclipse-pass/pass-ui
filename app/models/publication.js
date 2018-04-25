import DS from 'ember-data';

export default DS.Model.extend({
  // doi, title, abstract, journal, volume, issue
  doi: DS.attr('string'),
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  volume: DS.attr('string'),
  issue: DS.attr('string'),

  journal: DS.belongsTo('journal', { autoSave: true }),
  submissions: DS.hasMany('submission', { async: true })
});
