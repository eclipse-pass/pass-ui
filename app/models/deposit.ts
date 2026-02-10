import Model, { attr, belongsTo } from '@ember-data/model';
import type RepositoryCopyModel from './repository-copy';
import type SubmissionModel from './submission';
import type RepositoryModel from './repository';

export default class DepositModel extends Model {
  @attr('string') declare depositStatusRef: string;
  @attr('string') declare depositStatus: string;
  @attr('string') declare statusMessage: string;

  @belongsTo('repository-copy', { async: false, inverse: null }) declare repositoryCopy: RepositoryCopyModel;
  @belongsTo('submission', { async: false, inverse: null }) declare submission: SubmissionModel;
  @belongsTo('repository', { async: false, inverse: null }) declare repository: RepositoryModel;
}
