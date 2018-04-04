import DS from 'ember-data';

export default DS.Model.extend({
  /** Repository being deposited to (REQUIRED) */
  repository: DS.belongsTo('repository'),
  /** ID assigned by the repository */
  assignedId: DS.attr('string'),
  /** URL to access the item in the repository, could allow User to see final result */
  accessUrl: DS.attr('string'),
  /**
   * Deposit status (REQUIRED). Possible values:
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

  // TODO for later updates
  // submission: DS.belongsTo('submission'),
  /**
   * True if the Deposit has stalled due to a need for further action by the User. This action may need
   * to take place outside of the scope of the PASS system, e.g. contact NIHMS to complete submission.
   * When set to true, if other Deposits are in compliance, this will cause the Submission status to
   * become non-compliant-in-progress. If the Deposit is stalled due to e.g. a system error and the User
   * does not need to take action, this should remain false.
   */
  // userActionRequired: DS.attr('boolean'),

  // updatedDate: DS.attr('date'),
});
