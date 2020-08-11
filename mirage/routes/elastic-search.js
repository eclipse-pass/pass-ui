import { pluralize } from 'ember-inflector';

export default function (server) {
  /**
   * Mock the responses from elastic search
   */
  server.get('http://localhost:9200/pass/**', () => true);
  /**
   * Mock the responses from elastic search
   */
  server.post('http://localhost:9200/pass/**', (schema, request) => {
    let models;
    let suggest;
    let elasticResponse = {};
    let searchSuggest = JSON.parse(request.requestBody).suggest;

    if (searchSuggest && Object.keys(searchSuggest).firstObject === 'journalName') {
      suggest = [schema.journals.findBy({ journalName: JSON.parse(request.requestBody).suggest.journalName.prefix })];
      elasticResponse.suggest = {
        journalName: [{
          options: suggest
        }]
      };
    } else {
      let type = JSON.parse(request.requestBody)
        .query.bool.filter
        .term['@type']
        .toLowerCase();
      type = pluralize(type);

      models = schema[type].all().models.map(model => model.attrs);

      elasticResponse.hits = {
        max_score: 1,
        hits: models,
        total: models.length
      };
    }

    return elasticResponse;
  });
}
