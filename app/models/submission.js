import DS from 'ember-data';

export default DS.Model.extend({
  status: DS.attr('string', { defaultValue: 'PND' }),
  dateSubmitted: DS.attr('date'),
  source: DS.attr('string'),
  metadata: DS.attr(),
  pubmedId: DS.attr('string'),
  submitted: DS.attr('boolean', { defaultValue: false }),
  files: DS.attr(),

  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', { async: true }), // not on this model on API
  deposits: DS.hasMany('deposit', {async: true}),
  grants: DS.hasMany('grant', { async: true }),
});
