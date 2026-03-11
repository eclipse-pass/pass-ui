import Service, { service } from '@ember/service';
import { query as queryBuilder } from 'pass-ui/builders/pass-api';
import type { JsonApiDocument } from 'pass-ui/types/json-api';

export default class AutocompleteService extends Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

  /**
   * Get suggestions for autocomplete possibilities based on the given
   * prefix and property name.
   *
   * Despite the field being called a "prefix" the suggest prefix intended behavior
   * was to match the start of any word within a property value. For example, it would
   * match the start of any word in journal name.
   *
   * Switching to JSON:API implementation, we are simply looking for the the string
   * anywhere in the field value, as treating it as a prefix would match only the
   * start of the whole field, rather than the start of any word in the field. This
   * will mean that the given input could be matched in the middle or end of a word.
   *
   * The comma delimiting the field/value pairs denotes a logical OR (semicolon would
   * mean a logical AND)
   *
   * Query: fieldName=ini=*value*,field2=ini=*value*
   * Matches: entities where the value appears anywhere in the given field,
   *          ignoring case
   *
   * @param {string} type model type to return
   * @param {array|string} fieldName model property to autocomplete from. Can be array of values
   * @param {string} suggestPrefix prefix term that will be autocompleted
   * @param {object} context (OPTIONAL) contextual filters, already properly formatted for a
   *                                    Ember data store query
   * @returns {array} array of model objects
   */
  suggest(
    type: string,
    fieldName: string | string[],
    suggestPrefix: string,
    context: Record<string, Record<string, string>> = {},
  ) {
    if (!type) {
      return Promise.reject(new Error('No model type provided to the autocomplete service'));
    }
    if (!fieldName || fieldName === '') {
      return Promise.reject(new Error("No 'fieldName' was provided to the autocomplete service"));
    }
    if (!suggestPrefix) {
      return Promise.reject(new Error("No 'suggestPrefix' was provided to the autocomplete service."));
    }

    // Modify the context, if available
    if (!Array.isArray(fieldName)) {
      fieldName = [fieldName];
    }

    const query: Record<string, Record<string, string>> = { filter: {}, ...context };

    const suggestFilterPart = fieldName.map((field) => `${field}=ini="*${suggestPrefix}*"`).join(',');

    // Append the suggest filter piece to the existing type filter, if it exists
    const filterObj = query['filter'] ?? {};
    filterObj[type] = filterObj[type] ? `${filterObj[type]};${suggestFilterPart}` : suggestFilterPart;
    query['filter'] = filterObj;

    return this.store
      .request(queryBuilder(type, query))
      .then((result: JsonApiDocument<unknown[]>) => result.content.data)
      .catch((error: unknown) => {
        console.error(`Autocomplete service failed: ${JSON.stringify(error)}`);
      });
  }
}
