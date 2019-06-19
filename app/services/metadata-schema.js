/* eslint-disable indent */
import Ember from 'ember';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';
import Ajv from 'ajv'; // https://github.com/epoberezkin/ajv
import _ from 'lodash';

/**
 * Service to manipulate Alpaca schemas
 */
export default Service.extend({
  ajax: Ember.inject.service('ajax'),
  schemaService: ENV.schemaService,

  // JSON schema validator
  validator: undefined,

  init() {
    this._super(...arguments);
    /**
     * We can adjust logging for the JSON schema validator here.
     *
     * Currently, logging is simply disabled.
     *
     * We could set 'logger' to an object with `log`, `warn`, and `error` functions
     * to handle these things, if there is a need.
     */
    this.set('validator', new Ajv({
      logger: false
    }));
  },

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
   * @param {array} readonly list of properties that should be marked as read-only
   * @Returns {object} the modified schema
   */
  addDisplayData(schema, data, readonly) {
    if (!schema.data) {
      schema.data = {};
    }
    schema.data = Object.assign(schema.data, data);

    if (readonly && readonly.length > 0) {
      Object.keys(data).filter(key => readonly.includes(key)).forEach((key) => {
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
    if (!schema.hasOwnProperty('definitions')) {
      return schema;
    }
    return {
      schema: schema.definitions.form,
      options: schema.definitions.options || schema.definitions.form.options
    };
  },

  validate(schema, data) {
    return this.get('validator').validate(schema, data);
  },

  getErrors() {
    return this.get('validator').errors;
  },

  /**
   * Get all unique field names across a set of schema. For each schema,
   *
   * @param {array} schemas array of schemas
   */
  getFields(schemas) {
    let fields = [];

    schemas.map(schema => this.alpacafySchema(schema))
      .forEach((schema) => {
        Object.keys(schema.schema.properties)
          .filter(key => !fields.includes(key))
          .forEach(key => fields.push(key));
      });

    /**
     * Add fields from properties defined in schema.allOf
     * Make sure the top level `schema.additionalProperties` is not explicitly set to FALSE
     */
    schemas.filter(schema => (schema.additionalProperties !== false) && schema.allOf)
      .map(schema => schema.allOf)
      .forEach((allOf) => {
        allOf.filter(schema => schema.properties) // Make sure the schema has a 'properties' property
          .map(schema => schema.properties) // Operate on schema.properties
          .forEach((props) => {
            Object.keys(props).filter(key => !fields.includes(key))
              .forEach(key => fields.push(key));
          });
      });

    return fields;
  },

  /**
   * Get a "title" value for a schema property. If a 'title' property exists, use that value. If
   * one does not exist, format the key.
   *
   * @param {Object} property a schema property
   * @param {string} key the property key
   * @returns {string} the property title, if one exists, or a formatted version of the properties key
   */
  propertyTitle(property, key) {
    return property.title || _.capitalize(key.replace('-', ' '));
  },

  /**
   * Return map from field key to field title. Use title from the schema or
   * just munge the key. Fields from additional schemas in `schema.allOf`
   * should be added to the map as well.
   *
   * @param {array} schemas array of schemas
   */
  getFieldTitleMap(schemas) {
    let map = {};

    schemas.forEach((schema) => {
      let props = schema.definitions.form.properties;

      Object.keys(props).forEach((key) => {
        map[key] = this.propertyTitle(props[key], key);
      });

      /**
       * Note: additionalProperties: undefined (or if it does not exist)
       * should count as truthy
       * See logic from #getFields
       */
      if (schema.additionalProperties !== false && Array.isArray(schema.allOf)) {
        schema.allOf.filter(schema => schema.properties)
          .map(schema => schema.properties)
          .forEach((props) => {
            Object.keys(props).forEach((key) => {
              if (!map.hasOwnProperty(key)) {
                map[key] = this.propertyTitle(props[key], key);
              }
            });
          });
      }
    });

    return map;
  },

  /**
   * Merge data from metadata blob2 into metadata blob1 and output the result as a new
   * object (this operation will not mutate either input objects). Broken out here in
   * case special logic needs to be assigned.
   *
   * Impl note: each blob now has a default value set of an empty object because
   * Object.assign will die if any arguments is undefined
   *
   * @param {object} blob1 arbitrary JSON object representing metadata for a submission
   * @param {object} blob2 arbitrary JSON object representing metadata for a submission
   */
  mergeBlobs(blob1 = {}, blob2 = {}) {
    let blob = Object.assign(blob1, blob2);
    Object.keys(blob).filter(key => !(key in blob)).forEach(key => delete blob[key]);

    return blob;
  },

  /**
   * Get a metadata blob containing information about repository agreements. The resulting
   * object can be merged into the larger metadata blob with #mergeBlobs.
   *
   * @param {object} repositories list of Repository model objects
   * @returns {
   *    'agreements': [
   *      {
   *        Repository.name: Repository.agreementText
   *      }
   *    ]
   * }
   */
  getAgreementsBlob(repositories) {
    const result = [];

    repositories.filter(repo => repo.get('agreementText')).forEach(repo => result.push({
      [repo.get('name')]: repo.get('agreementText')
    }));

    return {
      agreements: result
    };
  },

  /**
   * Return metadata object as a set of label, string entries for display.
   *
   * @param {*} key
   * @param {*} obj
   */
  _formatComplexMetadataObject(key, obj) {
    if (key === 'issns') {
      let issn = obj.issn;

      if ('pubType' in obj) {
        issn += ` (${obj.pubType})`;
      }

      return { ISSN: issn };
    } else if (key == 'authors') {
      let author = obj.author;

      if ('orcid' in obj) {
        author += ` (${obj.orcid})`;
      }

      return { Author: author };
    }

    return obj;
  },

  /**
   * Return metadata value for display.
   *
   * @param {*} key
   * @param {*} obj
   */
  _formatMetadata(key, val) {
    if (Array.isArray(val)) {
      return val.map(o => this._formatComplexMetadataObject(key, o));
    } else if (typeof val === 'object') {
      return this._formatComplexMetadataObject(key, val);
    } else if (typeof val === 'string') {
      return val;
    }

    return null;
  },

  /**
   * Returns an array of values suitable to display the metadata asscoiated with a
   * submission.
   *
   * @param {*} submission
   * @returns [{label, value, isArray}]
   */
  async displayMetadata(submission) {
      // Metadata keys to display and the order to display them in.
    const whiteList = ['authors', 'abstract', 'doi', 'Embargo-end-date', 'journal-NLMTA-ID', 'journal-title', 'journal-title-short', 'issue', 'issns',
                        'publisher', 'publicationDate', 'title', 'volume'];

    const schemas = await this.getMetadataSchemas(submission.get('repositories'));
    const titleMap = this.getFieldTitleMap(schemas);
    const metadata = JSON.parse(submission.get('metadata'));

    const result = [];
    whiteList.filter(key => key in metadata).forEach((key) => {
      const value = this._formatMetadata(key, metadata[key]);
      const isArray = Array.isArray(value);

      if (value) {
        result.push({
          label: titleMap[key],
          value,
          isArray
        });
      }
    });

    return result;
  }
});
