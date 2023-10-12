import Model, { attr, hasMany } from '@ember-data/model';

export default class PolicyModel extends Model {
  @attr('string') title;
  @attr('string') description;
  @attr('string') policyUrl;

  @hasMany('repository') repositories;
  @attr('string') institution;

  @attr('string') _type;
}
