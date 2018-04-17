import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  status: DS.attr('string', { defaultValue: 'PND' }),
  doi: DS.attr('string'),
  dateSubmitted: DS.attr('date'),
  volume: DS.attr('string'),
  issue: DS.attr('string'),
  source: DS.attr('string'),
  metadata: DS.attr(),
  pubmedId: DS.attr('string'),
  submitted: DS.attr('boolean', { defaultValue: false }),
  files: DS.attr(),

  journal: DS.belongsTo('journal', { autoSave: true }),
  deposits: DS.hasMany('deposit', { async: true }), // not on this model on API
  grants: DS.hasMany('grant', { async: true }),
});
