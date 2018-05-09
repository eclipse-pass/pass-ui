import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

function _adaptResults(results, fieldName, type) {
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
        toAdd[fieldName] = option.text;
        adapted.push(toAdd);
      });
  }

  return adapted;
}

/**
 * Service designed to hit the Elasticsearch autocomplete service to get suggestions
 * for autocompletion.
 *
 * TODO do we need to pass authentication headers?
 *
 * Example POST:
 * data: {
 *    "suggest": {
 *      "my-suggest" : {
 *        "prefix" : "R",
 *        "completion" : { "field" : "awardNumber_suggest" }
 *      }
 *    }
 *  }
 *  -----------------------------------------------------------------
 * Example response:
 *  {
 *    "took" : 68,
 *    "timed_out" : false,
 *    "_shards" : {
 *      ...
 *    },
 *    "hits" : {
 *      ...
 *    },
 *    "suggest" : {
 *      "my-suggest" : [
 *        {
 *          "text" : "AA",
 *          "offset" : 0,
 *          "length" : 2,
 *          "options" : [
 *            {
 *              "text" : "AAPS Journal",
 *              "_index" : "pass",
 *              "_type" : "_doc",
 *              "_id" : "...",
 *              "_score" : 1.0,
 *              "_source" : {
 *                "journalName" : "AAPS Journal",
 *                "@type" : "Journal",
 *                "pmcParticipation" : "A",
 *                "@id" : "http://localhost:8080/fcrepo/rest/journals/28/a2/9c/00/28a29c00-bc53-4278-8b9b-92a8ddc285e6",
 *                "nlmta" : "AAPS J"
 *              }
 *            },
 *            ...
 *          ]
 *        }
 *      ]
 *    }
 *  }
 */
export default Service.extend({
  ajax: Ember.inject.service(),
  base: Ember.computed(() => ENV.fedora.elasticsearch),
  es_field_suffix: '_suggest',

  /**
   * Get suggestions for autocomplete possibilities based on the given
   * prefix and property name.
   *
   * @param {string} fieldName model property to autocomplete from
   * @param {string} suggestPrefix prefix term that will be autocompleted
   * @param {string} type (OPTIONAL) object type to return
   * @param {string} esIndex (OPTIONAL) not actually the index name, instead, it seems this is just the name
   *                         that Elasticsearch will give the autocomplete results (???)
   * @returns {array} array of objects
   *                  {
   *                    suggestion: 'the autocompleted suggestion',
   *                    id: `string ID of the associated Journal model object`
   *                  }
   */
  suggest(fieldName, suggestPrefix, type, esIndex = 'my-suggest') {
    let esFieldName = fieldName;
    if (!esFieldName.endsWith(this.get('es_field_suffix'))) {
      esFieldName += this.get('es_field_suffix');
    }

    let data = { suggest: {} };
    data.suggest[esIndex] = {
      prefix: suggestPrefix,
      completion: { field: esFieldName }
    };

    return this.get('ajax').post(this.get('base'), {
      data,
      headers: this._headers()
    }).then((res) => {
      let suggestions = res.suggest[esIndex];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return _adaptResults(suggestions[0], fieldName, type);
      }
      return _adaptResults(suggestions, fieldName, type);
    });
  },

  _headers() {
    return {
      'Content-Type': 'application/json; charset=utf-8'
    };
  },

});
