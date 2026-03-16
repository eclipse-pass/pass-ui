import Model, { attr } from '@ember-data/model';

export default class UserModel extends Model {
  /**
   * (Required)
   */
  @attr('string') declare username: string;
  @attr('string') declare firstName: string;
  @attr('string') declare middleName: string;
  @attr('string') declare lastName: string;
  @attr('string') declare displayName: string;
  @attr('string') declare email: string;
  @attr('string') declare orcidId: string;

  @attr('set') declare affiliation: string[];
  @attr('set') declare locatorIds: string[];
  /** Possible values: admin, submitter */
  @attr('set') declare roles: string[];

  get isSubmitter(): boolean {
    return this.roles ? this.roles.includes('submitter') : false;
  }

  get isAdmin(): boolean {
    return this.roles ? this.roles.includes('admin') : false;
  }
}
