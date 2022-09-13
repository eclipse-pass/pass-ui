/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class RepositoryModel extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('string') url;
  @attr('string') formSchema;
  @attr('enum') integrationType;
  @attr('string', { defaultValue: false }) agreementText;
  @attr('enum') repositoryKey;

  @attr('boolean') _selected;

  @computed('integrationType')
  get _isWebLink() {
    return this.integrationType === 'web-link';
  }
}

export const IntegrationType = {
  FULL: 'FULL',
  ONE_WAY: 'ONE_WAY',
  WEB_LINK: 'WEB_LINK',
};

// String field, not enum
export const KnownKeys = {
  PMC: 'pmc',
  JSCHOLARSHIP: 'jscholarship',
  ERIC: 'eric',
  DEC: 'dec',
  DASH: 'dash',
};
