import Model, { attr } from '@ember-data/model';

export default class RepositoryModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare description: string;
  @attr('string') declare url: string;
  @attr('string') declare formSchema: string;
  @attr('string') declare integrationType: string;
  @attr('string', { defaultValue: false }) declare agreementText: string;
  @attr('string') declare repositoryKey: string;
  @attr('set') declare schemas: string[];

  @attr('boolean') declare _selected: boolean;

  get _isWebLink(): boolean {
    return this.integrationType === 'web-link';
  }
}

export const IntegrationType = {
  FULL: 'FULL',
  ONE_WAY: 'ONE_WAY',
  WEB_LINK: 'WEB_LINK',
} as const;

// String field, not enum
export const KnownKeys = {
  PMC: 'pmc',
  JSCHOLARSHIP: 'jscholarship',
  ERIC: 'eric',
  DEC: 'dec',
  DASH: 'dash',
} as const;
