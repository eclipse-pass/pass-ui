import Model, { attr, belongsTo } from '@ember-data/model';
import type PublicationModel from './publication';
import type RepositoryModel from './repository';

export default class RepositoryCopyModel extends Model {
  @attr('set') declare externalIds: string[];
  @attr('string') declare accessUrl: string;
  @attr('string') declare copyStatus: string;

  @belongsTo('publication', { async: false, inverse: null }) declare publication: PublicationModel;
  @belongsTo('repository', { async: false, inverse: null }) declare repository: RepositoryModel;
}

export const CopyStatus = {
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  STALLED: 'STALLED',
  COMPLETE: 'COMPLETE',
  REJECTED: 'REJECTED',
} as const;
