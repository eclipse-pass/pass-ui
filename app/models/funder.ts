import Model, { attr, belongsTo } from '@ember-data/model';
import type PolicyModel from './policy';

export default class FunderModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare url: string;
  @attr('string') declare localKey: string;

  @belongsTo('policy', { async: false, inverse: null }) declare policy: PolicyModel;
}
