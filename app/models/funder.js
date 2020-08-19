import Model, { attr, belongsTo } from '@ember-data/model';

export default class FunderModel extends Model {
  @attr('string') name;
  @attr('string') url;
  @attr('string') localKey;

  @belongsTo('policy') policy;
}
