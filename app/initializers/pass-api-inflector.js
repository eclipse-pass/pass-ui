import { uncountable } from '@ember-data/request-utils/string';

const MODEL_NAMES = [
  'deposit',
  'file',
  'funder',
  'grant',
  'journal',
  'person',
  'policy',
  'publication',
  'repository-copy',
  'repository',
  'submission-event',
  'submission',
  'user',
];

/**
 * Our API does not use pluralized model names for its endpoints.
 * Register uncountable rules with @ember-data/request-utils so Ember Data
 * does not pluralize model names in API paths. The adapter's pathForType
 * handles camelCase conversion for the API.
 */
export function initialize() {
  for (const name of MODEL_NAMES) {
    uncountable(name);
  }
}

export default {
  name: 'pass-api-inflector',
  initialize,
};
