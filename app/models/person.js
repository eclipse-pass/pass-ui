import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  /** (REQUIRED) */
  @attr('string') displayName;
  /** (REQUIRED) */
  @attr('string') email;
  @attr('string') orcid;
  // ---- Uncomment as needed in UI----
  @attr('string') firstName;
  @attr('string') middleName;
  @attr('string') lastName;
  @attr('string') institutionalId;
  @attr('string') affiliation;
}
