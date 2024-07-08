import Model, { attr } from '@ember-data/model';

export default class UserModel extends Model {
  /**
   * (Required)
   */
  @attr('string') username;
  @attr('string') firstName;
  @attr('string') middleName;
  @attr('string') lastName;
  @attr('string') displayName;
  @attr('string') email;
  @attr('string') orcidId;

  @attr('set') affiliation;
  @attr('set') locatorIds;
  /** Possible values: admin, submitter */
  @attr('set') roles;

  get isSubmitter() {
    return this.roles ? this.roles.includes('submitter') : false;
  }

  get isAdmin() {
    return this.roles ? this.roles.includes('admin') : false;
  }
}
