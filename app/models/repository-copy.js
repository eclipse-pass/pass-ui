import Model, { attr, belongsTo } from '@ember-data/model';

export default class RepositoryCopyModel extends Model {
  @attr('set') externalIds;
  @attr('string') accessUrl;
  @attr('string') copyStatus;

  @belongsTo('publication') publication;
  @belongsTo('repository') repository;
}
