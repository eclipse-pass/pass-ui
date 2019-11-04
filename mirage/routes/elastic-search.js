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
    let type = JSON.parse(request.requestBody)
      .query.bool.filter
      .term['@type']
      .toLowerCase();
    type = pluralize(type);

    let models = schema[type].all().models.map(model => model.attrs);

    var elasticReponse = {
      hits: {
        max_score: 1,
        hits: models,
        total: models.length
      }
    };

    return elasticReponse;
  });
}
