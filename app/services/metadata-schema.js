import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

export default Service.extend({
  ajax: Ember.inject.service('ajax'),
  schemaService: ENV.schemaService,

  /**
   * TODO: don't know the actual API yet!
   * @param {} repositories
   */
  getMetadataSchemas(repositories) {
    const url = this.get('url');
    return this.get('ajax').request(url, 'GET', {
      headers: {
        Accept: 'application/json; charset=utf-8'
      },
      data: {
        repositories
      }
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
    schema.data = data;
    return schema;
  }
});
