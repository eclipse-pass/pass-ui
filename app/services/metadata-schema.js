import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ember/config/environment';
import Ajv from 'ajv'; // https://github.com/epoberezkin/ajv
import _ from 'lodash';

/**
 * Service to manipulate Alpaca schemas
 */
export default Service.extend({
  ajax: service('ajax'),
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
     *
     * 'addUsedSchema' option allows us to provide the full JSON schema object to the validate function
     * of AJV without complaints. Without this option, the validate function will report an error because
     * AJV does not like compiling a JSON schema that it already knows about (based on the schema's '$id').
     * Speed can be improved if we enable this feature, then selectively add JSON schemas to avoid
     * the re-compile step.
     */
    this.set('validator', new Ajv({
      logger: false,
      addUsedSchema: false
    }));
  },

  /**
   * First try to get a single merged schema that combines all repository schema.
   * If that request fails, retry the request, but without trying to merge the schema.
   *
   * If the schema service fails to merge, it should return a 409 error. Any other error
   * will likely have an unknown cause and may not be recoverable.
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
    const urlWithMerge = `${url}?merge=true`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      processData: false,
      data: repositories
    };

    // TODO: would be nice if this used Fetch API, but current tests are written for AJAX
    return this.get('ajax')
      .request(urlWithMerge, options)
      .catch((response, jqXHR, payload) => {
        /**
         * error handling with `ember-ajax`: https://github.com/ember-cli/ember-ajax#access-the-response-in-case-of-error
         * jqXHR info : https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
         */
        if (jqXHR.status !== 409) {
          // Unknown error
          const msg = `Unknown error fetching merged metadata schema: ${jqXHR.statusText}`;
          // console.log(`msg \n${response}`, 'color:red;');
          throw new Error(msg);
        }

        return this.get('ajax').request(url, options);
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
    // Will merge 'data' onto 'schema.data'. 'schema.data' values may be overwritten by values from 'data'
    schema.data = Object.assign(schema.data, data);

    if (readonly && readonly.length > 0) {
      /**
       * For each key in the data object, if they are marked as "read only",
       * set the field's 'readonly' to true, and 'toolbarSticky' to false iff the
       * key refers to an array
       */
      Object.keys(data).filter(key => readonly.includes(key)).forEach((key) => {
        if (key in schema.options.fields) {
          if (Array.isArray(data[key])) {
            schema.options.fields[key].toolbarSticky = false;
          }
          schema.options.fields[key].readonly = true;
        }
      });
    }

    return schema;
  },

  /**
   * Map a JSON schema to on that Alpaca will recognize.
   *
   * If a field of `type: 'array'` is marked as `required` in the schema, remove that
   * required status only for the alpacafied schema.
   *
   * @param {object} schema JSON schema from the schema service
   */
  alpacafySchema(schema) {
    if (!schema.hasOwnProperty('definitions')) {
      return schema;
    }

    Object.keys(schema.definitions.form.properties).filter(key => schema.definitions.form.properties[key].type === 'array')
      .forEach((key) => {
        const req = schema.definitions.form.required;
        if (Array.isArray(req) && req.includes(key)) {
          req.splice(req.indexOf(key), 1);
        }
      });

    return {
      schema: schema.definitions.form,
      options: schema.definitions.options || schema.definitions.form.options
    };
  },

  /**
   * Remove the schema's title to avoid showing it in the UI
   *
   * @param {object} schema JSON schema
   */
  untitleSchema(schema) {
    delete schema.definitions.form.title;
    return schema;
  },

  validate(schema, data) {
    return this.get('validator').validate(schema, data);
  },

  getErrors() {
    return this.get('validator').errors;
  },

  /**
   * Get all unique field names across a set of schema. This includes any unique field
   * in schema referenced in the 'allOf' validation sections, unless otherwise specified.
   *
   * @param {array} schemas array of schemas
   * @param {boolean} onlyVisibleFields should this only return rendered fields
   *                  this will ignore any unique fields that may be present in a linked
   *                  schema in the 'allOf' section
   * @returns {array} list of unique field keys
   */
  getFields(schemas, onlyVisibleFields) {
    let fields = [];

    schemas.map(schema => this.alpacafySchema(schema))
      .forEach((schema) => {
        Object.keys(schema.schema.properties)
          .filter(key => !fields.includes(key))
          .forEach(key => fields.push(key));
      });

    // Return early
    if (onlyVisibleFields) {
      return fields;
    }

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
   * object (this operation will not mutate either input objects). Think of this merge
   * as overwriting values from 'blob2' in 'blob1' to get the output blob.
   *
   * A list of fields can be provided specifying the field keys that can be deleted
   * during this merge - it is possible to have keys that are _required_ for various
   * business logic reasons. Defining this list will make it so that if a key is NOT
   * present in 'blob2' and IS present in the 'deletableFields' list, then that key
   * will be deleted from the merged blob. If you do not want _any_ fields to be
   * able to be deleted from the merged blob, 'deletableFields' can be UNDEFINED or
   * an empty array.
   *
   * Impl note: each blob now has a default value set of an empty object because
   * Object.assign will die if any arguments is undefined
   *
   * @param {object} blob1 arbitrary JSON object representing metadata for a submission
   * @param {object} blob2 arbitrary JSON object representing metadata for a submission
   * @param {array} deletableFields list of keys that can be deleted
   *                if UNDNEFINED, assume that no fields can be deleted
   */
  mergeBlobs(blob1 = {}, blob2 = {}, deletableFields) {
    let blob = Object.assign(blob1, blob2);

    if (Array.isArray(deletableFields) && deletableFields.length > 0) {
      // Filter out only keys that DO NOT appear in "blob2" and DO appear in the deletableFields list
      Object.keys(blob).filter(key => !(key in blob2) && deletableFields.includes(key))
        .forEach(key => delete blob[key]);
    }

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
