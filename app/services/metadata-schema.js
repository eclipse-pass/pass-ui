import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

/**
 * Service to manipulate Alpaca schemas
 */
export default Service.extend({
  ajax: Ember.inject.service('ajax'),
  schemaService: ENV.schemaService,

  /**
   *
   * @param {array} repositories list of repository URIs
   * @returns {array} list of schemas relevant to the given repositories
   */
  getMetadataSchemas(repositories) {
    const areObjects = repositories.map(repos => typeof repos).includes('object');
    if (areObjects) {
      // If we've gotten repository objects, map them to their IDs
      repositories = repositories.map(repo => repo.get('id'));
    }
    const url = this.get('schemaService.url');

    return this.get('ajax').request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      processData: false,
      data: repositories
    });
  },

  /**
   * Add data to a metadata form schema to be prepopulated in the rendered form. Optionally
   * force these fields to be read-only.
   *
   * @param {object} schema metadata (form) schema
   * @param {object} data display data to add to the schema
   * @param {boolean} setReadOnly force updated fields to be read-only in the generated form
   * @Returns {object} the modified schema
   */
  addDisplayData(schema, data, setReadOnly) {
    if (!schema.data) {
      schema.data = {};
    }
    schema.data = Object.assign(schema.data, data);

    if (setReadOnly) {
      Object.keys(data).forEach((key) => {
        if (schema.options.fields.hasOwnProperty(key)) {
          schema.options.fields[key].readonly = true;
        }
      });
    }

    return schema;
  },

  /**
   * Map a JSON schema to on that Alpaca will recognize.
   *
   * @param {object} schema JSON schema from the schema service
   */
  alpacafySchema(schema) {
    return {
      schema: schema.definitions.form,
      options: schema.definitions.options || schema.definitions.form.options
    };
  }
});
