import Model, { attr, belongsTo } from '@ember-data/model';

export default class DepositModel extends Model {
  @attr('string') depositStatusRef;
  @attr('string') depositStatus;

  @belongsTo('repositoryCopy') repositoryCopy;
  @belongsTo('submission') submission;
  @belongsTo('repository') repository;
}
