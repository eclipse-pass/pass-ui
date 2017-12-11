import DS from 'ember-data';

export default DS.Model.extend({
  repo: DS.attr('string'),
  assignedId: DS.belongsTo('identifier'),
  grant: DS.belongsTo('grant'),
  updatedDate: DS.attr('date'),

  /* Deposit status {new, in-progress, accepted} */
  status: DS.attr('string'),

  /* Whether this deposit is specifically requested by the user,
   * rather than implicit by policy.
   */
  requested: DS.attr('boolean')
});
