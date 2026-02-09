import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  /** (REQUIRED) */
  @attr('string') declare displayName: string;
  /** (REQUIRED) */
  @attr('string') declare email: string;
  @attr('string') declare orcid: string;
  @attr('string') declare firstName: string;
  @attr('string') declare middleName: string;
  @attr('string') declare lastName: string;
  @attr('string') declare institutionalId: string;
  @attr('string') declare affiliation: string;
}
