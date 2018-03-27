import DS from 'ember-data';

export default DS.Model.extend({
  /** Award number from a funder (Required) */
  awardNumber: DS.attr('string'),
  /** Title of the research project (Required) */
  projectName: DS.attr('string'),
  /**
   * The sponsor that is the original source of the funds. (Required)
   * Often the same as {@link #directFunder}
   */
  primaryFunder: DS.belongsTo('funder'),
  /** The organization from which funds are directly received. (Required)
   * Often the same as {@link #primaryFunder}
   */
  directFunder: DS.belongsTo('funder'),
  /** Date the grant was awarded (Required) */
  awardDate: DS.attr('date'),
  /** Date the grant started */
  startDate: DS.attr('date'),
  /** Date the grant ended */
  endDate: DS.attr('date'),
  /** Award number or ID assigned to the grant within the researcher's institution */
  localAwardId: DS.belongsTo('identifier'),
  /** Status of award. Possible values:
   *  - active (grant currently active)
   *  - pre_award (award not yet received)
   *  - terminated (grant period is complete)
   */
  awardStatus: DS.attr('string'),
  /** Principal investigator */
  pi: DS.belongsTo('person'),
  /** List of co-principal investigators */
  coPis: DS.hasMany('person', { async: true }),
  /** List of submissions related to this grant */
  submissions: DS.hasMany('submission', { async: true }),

  oapCompliance: DS.attr('string'),
  creator: DS.belongsTo('user'),
  creationDate: DS.attr('date'),

});
