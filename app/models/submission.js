import DS from 'ember-data';

export default DS.Model.extend({
  depositStatus: DS.attr('string', { defaultValue: 'PND' }),
  userSubmittedDate: DS.attr('date'),
  source: DS.attr('string'),
  metadata: DS.attr(),
  pubmedId: DS.attr('string'),
  submitted: DS.attr('boolean', { defaultValue: false }),
  files: DS.attr(),

  user: DS.belongsTo('user'),
  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', { async: true }), // not on this model on API
  deposits: DS.hasMany('deposit', {async: true}),
  grants: DS.hasMany('grant', { async: true }),
});
