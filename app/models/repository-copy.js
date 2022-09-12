import Model, { attr, belongsTo } from '@ember-data/model';

export default class RepositoryCopyModel extends Model {
  @attr('set') externalIds;
  @attr('string') accessUrl;
  @attr('enum') copyStatus;

  @belongsTo('publication') publication;
  @belongsTo('repository') repository;
}

export const CopyStatus = {
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  STALLED: 'STALLED',
  COMPLETE: 'COMPLETE',
  REJECTED: 'REJECTED',
};
