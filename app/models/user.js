/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

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

  @computed('roles.[]')
  get isSubmitter() {
    return this.roles ? this.roles.includes('submitter') || this.roles.includes('SUBMITTER') : false;
  }

  @computed('roles.[]')
  get isAdmin() {
    return this.roles ? this.roles.includes('admin') || this.roles.includes('ADMIN') : false;
  }
}
