import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { camelize } from '@ember/string';

/**
 * PASS specific extensions for Ember Data's JSON:API adapter
 */
export default class PassJsonApiAdapter extends JSONAPIAdapter {
  // Camel case instead of pluralize model types for our API
  pathForType(type) {
    return camelize(type);
  }
}
