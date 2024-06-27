import Model, { attr, belongsTo } from '@ember-data/model';

export default class RepositoryCopyModel extends Model {
  @attr('set') externalIds;
  @attr('string') accessUrl;
  @attr('string') copyStatus;

  @belongsTo('publication', { async: false, inverse: null }) publication;
  @belongsTo('repository', { async: false, inverse: null }) repository;
}

export const CopyStatus = {
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  STALLED: 'STALLED',
  COMPLETE: 'COMPLETE',
  REJECTED: 'REJECTED',
};
