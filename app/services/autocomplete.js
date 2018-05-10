import Service from '@ember/service';
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
  ajax: Ember.inject.service(),
  base: Ember.computed(() => ENV.fedora.elasticsearch),
  es_field_suffix: '_suggest',

  /**
   * Get suggestions for autocomplete possibilities based on the given
   * prefix and property name.
   *
   * @param {array|string} fieldName model property to autocomplete from. Can be array of values
   * @param {string} suggestPrefix prefix term that will be autocompleted
   * @param {string} type (OPTIONAL) object type to return
   * @returns {array} array of objects
   *                  {
   *                    suggestion: 'the autocompleted suggestion',
   *                    id: `string ID of the associated Journal model object`
   *                  }
   */
  suggest(fieldName, suggestPrefix, type) {
    if (!fieldName || fieldName === '') {
      return Promise.reject(new Error('No \'fieldName\' was provided to the autocomplete service'));
    }
    if (!suggestPrefix) {
      return Promise.reject(new Error('No \'suggestPrefix\' was provided to the autocomplete service.'));
    }

    let data = { suggest: {} };

    if (Array.isArray(fieldName)) {
      fieldName.forEach((name) => {
        data.suggest[name] = this._suggestQueryPart(name, suggestPrefix);
      });
    } else {
      data.suggest[fieldName] = this._suggestQueryPart(fieldName, suggestPrefix);
    }

    return this.get('ajax').post(this.get('base'), {
      data,
      headers: this._headers()
    }).then((res) => {
      let moo = this._adaptResults(res, type);
      // debugger
      return moo;
    });
  },

  _suggestQueryPart(fieldName, prefix) {
    let esFieldName = fieldName;
    if (!esFieldName.endsWith(this.get('es_field_suffix'))) {
      esFieldName += this.get('es_field_suffix');
    }

    return {
      prefix,
      completion: { field: esFieldName }
    };
  },

  /**
   * Adapt Elasticsearch results to a flat array
   *
   * @param {object} response response from Elasticsearch
   * @param {string} type (OPTIONAL) target source object type
   */
  _adaptResults(response, type) {
    let results = [];
    Object.keys(response.suggest).forEach((field) => {
      let moo = this._adapt(response.suggest[field][0], field, type);
      results = results.concat(moo);
    });
    // Remove duplicates and return
    return results;
  },

  _adapt(results, fieldName, type) {
    let adapted = [];
    if (Array.isArray(results.options)) {
      // First, if 'type' is declared, filter options by given type
      // If 'type' is not declared, then pass all options
      results.options
        .filter(option => !type || option._source['@type'] === type)
        .forEach((option) => {
          let toAdd = {
            id: option._source['@id']
          };
          toAdd[fieldName] = option._source[fieldName];
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
