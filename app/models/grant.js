import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class GrantModel extends Model {
  /** Award number from a funder (REQUIRED) */
  @attr('string') awardNumber;
  /** Possible values: active, pre_award, terminated */
  @attr('string') awardStatus;
  @attr('string') localKey;
  @attr('string') projectName;
  @attr('date') awardDate;
  @attr('date') startDate;
  /** Date the grant ended */
  @attr('date') endDate;

  @belongsTo('user', { async: false, inverse: null }) pi;
  @hasMany('user', { async: false, inverse: null }) coPis;
  @belongsTo('funder', { async: true, inverse: null }) primaryFunder;
  @belongsTo('funder', { async: false, inverse: null }) directFunder;
}
