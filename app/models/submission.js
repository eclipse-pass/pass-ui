import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * Status of the submission (REQUIRED). Possible values:
   *  - non-compoliant-not-started (submission not yet in compliance with applicable policies.
   *      One or more deposits have not been initiated)
   *  - non-compliant-in-progress (all required Deposits for the Submission have been initiated,
   *      but at least one could not be completed and may require additional work by the user
   *      before being classified as compliant (Deposit.userActionRequired=true). For example,
   *      if a User does not respond to the final approval email from the repository, the Deposit
   *      may not be completed within the compliance timeframe)
   *  - compliant-in-progress (submission is in compliance with all known applicable policies.
   *      All required deposits have been initiated, but at least one has not yet reached the
   *      'accepted' status. There is time remaining for the process to finish withing compliance
   *      timeframe)
   *  - compliant-complete (submission is in compliance with all known applicable policies. All
   *      related deposits have a status of 'accepted')
   */
  status: DS.attr('string'),
  /** Title of work represented by this Submission (Ex title of article) (REQUIRED) */
  title: DS.attr('string'),
  author: DS.belongsTo('person'),
  /** Contact name for corresponding author */
  corrAuthorName: DS.attr('string'),
  /** Contact email for the corresponding author */
  corrAuthorEmail: DS.attr('string'),
  /** Abstract for work represented by this submission */
  abstract: DS.attr('string'),
  /** DOI of item being submitted */
  doi: DS.attr('string'),
  /** Journal the submission is part of (if article) */
  journal: DS.belongsTo('journal'),
  /** Volume of journal that contains item (if article) */
  volume: DS.attr('string'),
  /** Issue of journal that contains item (if article) */
  issue: DS.attr('string'),
  /** List of places the submission will be deposited */
  deposits: DS.hasMany('deposit', { async: true }),
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  grants: DS.hasMany('grant', { async: true }),
  /** Workflows track the status of submission process */
  workflows: DS.hasMany('workflow', { async: true }),
  /** Date the item was submitted by the user through PASS */
  submittedDate: DS.attr('date'),
  /**
   * Indicates whether the item came from outside of PASS as an import or from this system.
   * Possible values:
   *  - pass (submission record was created via the PASS user interface)
   *  - other (submission was automatically created by harvesting and ingesting form a
   *           third party service e.g. NIHMS)
   */
  source: DS.attr('string'),

  copyright: DS.attr('string'), // Not in pass-data-model
  // TODO determine how to handle 'system properties'
  creator: DS.belongsTo('user'),
  creationDate: DS.attr('date'),
  updatedDate: DS.attr('date'),
});
