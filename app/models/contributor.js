import Model, { attr, belongsTo } from '@ember-data/model';

export default class ContributorModel extends Model {
  @attr('string') firstName;
  @attr('string') middleName;
  @attr('string') lastName;
  @attr('string') displayName;
  @attr('string') email;
  @attr('string') orcidId;
  @attr('set') affiliation;
  @attr('set') roles;

  @belongsTo('user') user;
  @belongsTo('publication') publication;
}

export const Role = {
  AUTHOR: 'AUTHOR',
  FIRST_AUTHOR: 'FIRST_AUTHOR',
  LAST_AUTHOR: 'LAST_AUTHOR',
  CORRESPONDING_AUTHOR: 'CORRESPONDING_AUTHOR',
};
