import Model, { attr, belongsTo } from '@ember-data/model';

export default class DepositModel extends Model {
  @attr('string') depositStatusRef;
  @attr('enum') depositStatus;

  @belongsTo('repositoryCopy') repositoryCopy;
  @belongsTo('submission') submission;
  @belongsTo('repository') repository;
}

export const DepositStatus = {
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  ACCEPTED: 'ACCEPTED',
};
