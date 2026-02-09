import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type UserModel from './user';
import type FunderModel from './funder';

export default class GrantModel extends Model {
  /** Award number from a funder (REQUIRED) */
  @attr('string') declare awardNumber: string;
  /** Possible values: active, pre_award, terminated */
  @attr('string') declare awardStatus: string;
  @attr('string') declare localKey: string;
  @attr('string') declare projectName: string;
  @attr('date') declare awardDate: Date;
  @attr('date') declare startDate: Date;
  /** Date the grant ended */
  @attr('date') declare endDate: Date;

  @belongsTo('user', { async: false, inverse: null }) declare pi: UserModel;
  @hasMany('user', { async: false, inverse: null }) declare coPis: UserModel[];
  @belongsTo('funder', { async: true, inverse: null }) declare primaryFunder: FunderModel;
  @belongsTo('funder', { async: false, inverse: null }) declare directFunder: FunderModel;
}
