import DS from 'ember-data';

export default DS.Model.extend({
  /* Deposit status {new, in-progress, accepted} */
  status: DS.attr('string'),
  repo: DS.attr('string'),
  updatedDate: DS.attr('date'),
   /* Whether this deposit is specifically requested by the user,
    * rather than implicit by policy.
    */
  isVoluntary: DS.attr('boolean'),
  assignedId: DS.attr('string'),
  userActionRequired: DS.attr('boolean'),

  // relationships
  submission: DS.belongsTo('submission'),
  repository: DS.belongsTo('repository')
});
