import Model, { attr, hasMany } from '@ember-data/model';
import type RepositoryModel from './repository';

export default class PolicyModel extends Model {
  @attr('string') declare title: string;
  @attr('string') declare description: string;
  @attr('string') declare policyUrl: string;

  @hasMany('repository', { async: false, inverse: null }) declare repositories: RepositoryModel[];
  @attr('string') declare institution: string;

  @attr('string') declare _type: string;
}
