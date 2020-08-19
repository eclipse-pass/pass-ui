import Model, { attr, belongsTo } from '@ember-data/model';

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

  @belongsTo('user') pi;
  @belongsTo('user') coPis;
  @belongsTo('funder') primaryFunder;
  @belongsTo('funder') directFunder;
}
