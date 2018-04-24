import DS from 'ember-data';

export default DS.Model.extend({
  aggregatedDepositStatus: DS.attr('string', { defaultValue: 'not-started' }),
  userSubmittedDate: DS.attr('date'),
  source: DS.attr('string', { defaultValue: 'pass' }),
  metadata: DS.attr('string', { defaultValue: '{}' }), // Stringified JSON
  // pubmedId: DS.attr('string'),
  submitted: DS.attr('boolean', { defaultValue: false }),
  files: DS.attr(),

  user: DS.belongsTo('user'),
  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', { async: true }), // not on this model on API
  deposits: DS.hasMany('deposit', { async: true }),
  grants: DS.hasMany('grant', { async: true }),
});
