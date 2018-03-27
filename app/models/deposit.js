import DS from 'ember-data';

export default DS.Model.extend({
  repository: DS.attr('string'),
  assignedId: DS.belongsTo('identifier'),
  // grant: DS.belongsTo('grant'),
  /**
   * Deposit status (Required). Possible values:
   *  - in-preparation (in progress in the PASS GUI)
   *  - ready-to-submit (user has clicked to submit, but deposit has not yet been sent to repository)
   *  - submitted (PASS has sent files to the repository and is waiting for an update on the status)
   *  - received (target repository has indicated that the files have been received)
   *  - in-progress (target repository is processing the files)
   *  - accepted (target repository has accepted the files and publication is pending if not already complete)
   */
  status: DS.attr('string'),
  /** Whether this deposit is specifically requested by the user, rather than implicit by policy. */
  requested: DS.attr('boolean'),

  updatedDate: DS.attr('date'),
});
