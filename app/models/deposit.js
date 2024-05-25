import Model, { attr, belongsTo } from '@ember-data/model';

export default class DepositModel extends Model {
  @attr('string') depositStatusRef;
  @attr('string') depositStatus;

  @belongsTo('repositoryCopy', { async: false, inverse: null }) repositoryCopy;
  @belongsTo('submission', { async: false, inverse: null }) submission;
  @belongsTo('repository', { async: false, inverse: null }) repository;
}

export const DepositStatus = {
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  ACCEPTED: 'ACCEPTED',
};
