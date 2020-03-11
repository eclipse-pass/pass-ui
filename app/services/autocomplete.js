import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';

/**
 * Service designed to hit the Elasticsearch autocomplete service to get suggestions
 * for autocompletion.
 *
 * See this link for sample requests/response:
 * https://gist.github.com/jabrah/594b3763592ba18813d6451f0022860f
 *
 * TODO do we need to pass authentication headers?
 */
export default Service.extend({
  suggestSize: 100,
  ajax: service(),
  base: computed(() => ENV.fedora.elasticsearch),
  es_field_suffix: '_suggest',

  /**
   * Get suggestions for autocomplete possibilities based on the given
   * prefix and property name.
   *
   * Note about context: filtering by restricting results by some related ID will take some ID
   * modification. The context object cannot handle full IDs that start with 'http(s)://',
   * the Fedora base URL must be removed.
   *
   * @param {array|string} fieldName model property to autocomplete from. Can be array of values
   * @param {string} suggestPrefix prefix term that will be autocompleted
   * @param {object} context (OPTIONAL) contextual filters, e.g. { context: { pi: "user_id" } }
   * @param {string} type (OPTIONAL) object type to return
   * @returns {array} array of objects
   *
   * Each object in the returned array includes the model object ID that is associated with the
   * suggestion. They objects will also include the original source object from the index.
   *
   * For example, an autocomplete is requested for:
   *   fieldNames: ['awardNumber', 'projectName']
   *   term: 'r'
   *
   * #suggest(fieldNames, term) will return an array that resembles:
   * [
   *  { id: '...', awardNumber: '...', projectName: '...', ... }, // All Grant properties will be present
   *  ...
   * ]
   */
  suggest(fieldName, suggestPrefix, context, type) {
    if (!fieldName || fieldName === '') {
      return Promise.reject(new Error('No \'fieldName\' was provided to the autocomplete service'));
    }
    if (!suggestPrefix) {
      return Promise.reject(new Error('No \'suggestPrefix\' was provided to the autocomplete service.'));
    }
    if (context && Array.isArray(context.pi)) {
      context.pi = context.pi.map((id) => {
        if (id.startsWith(ENV.fedora.base)) {
          id.slice(ENV.fedora.base.length - 1);
        }
      });
    } else if (context && context.pi && context.pi.startsWith(ENV.fedora.base)) {
      context.pi = context.pi.slice(ENV.fedora.base.length - 1);
    }
    if (type) { // Make sure first letter is capitalized
      type = type.charAt(0).toUpperCase() + type.slice(1);
    }

    let data = { suggest: {} };

    if (Array.isArray(fieldName)) {
      fieldName.forEach((name) => {
        data.suggest[name] = this._suggestQueryPart(name, suggestPrefix, context);
      });
    } else {
      data.suggest[fieldName] = this._suggestQueryPart(fieldName, suggestPrefix, context);
    }

    return this.get('ajax').post(this.get('base'), {
      data,
      headers: this._headers(),
      xhrFields: { withCredentials: true }
    }).then(res => this._adaptResults(res, type));
  },

  _suggestQueryPart(fieldName, prefix, context) {
    let esFieldName = fieldName;
    if (!esFieldName.endsWith(this.get('es_field_suffix'))) {
      esFieldName += this.get('es_field_suffix');
    }

    let query = {
      prefix,
      completion: {
        field: esFieldName,
        size: this.get('suggestSize')
      }
    };

    if (context) {
      query.completion.context = context;
      return query;
    }
    return query;
  },

  /**
   * Adapt Elasticsearch results to a flat array.
   *
   * Impl note:
   * 'response.suggest' is where Elasticsearch sticks the autocomplete suggestions.
   * The request was crafted so that suggestions for each desired field has results
   * keyed off of the field name. The results from each key is flattened.
   *
   * See this link for example request/response:
   * https://gist.github.com/jabrah/594b3763592ba18813d6451f0022860f#autocomplete-across-multiple-fields
   *
   * @param {object} response response from Elasticsearch
   * @param {string} type (OPTIONAL) target source object type
   */
  _adaptResults(response, type) {
    let results = [];
    Object.keys(response.suggest).forEach((field) => {
      results = results.concat(this._adapt(response.suggest[field][0], type));
    });
    return results;
  },

  _adapt(results, type) {
    let adapted = [];
    if (Array.isArray(results.options)) {
      // First, if 'type' is declared, filter options by given type
      // If 'type' is not declared, then pass all options
      results.options
        .filter(option => !type || option._source['@type'] === type)
        .forEach((option) => {
          if (!option._source || !option._source['@id']) {
            return;
          }
          let toAdd = Object.assign(option._source, { id: option._source['@id'] });
          adapted.push(toAdd);
        });
    }
    return adapted;
  },

  _headers() {
    return {
      'Content-Type': 'application/json; charset=utf-8'
    };
  },

});
