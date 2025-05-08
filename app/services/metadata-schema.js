/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get, ember/no-string-prototype-extensions */
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import surveySchema from './schema/surveyjs.json';
import repositorySchemas from './schema/repository.json';

/**
 * Service to manipulate metadata formschemas
 */

export default class MetadataSchemaService extends Service {
  constructor() {
    super(...arguments);
  }

  /**
   * Return SurveyJS schema for the given repositories.
   *
   * @param {array} repositories list of repository URIs
   * @param {array} readonly list of properties that should be marked as read-only
   * @returns schema relevant to the given repositories
   */
  getMetadataSchema(repositories, readonly) {
    // Each repository identifies a set of schemas which specify metadata fields for the user to fill out.
    // The repositorySchemas object contains this mapping and also indicate whether or not the field is
    // required or conditionally required. The surveySchema object is a SurveyJS schema which contains
    // every field which could be filled out.

    if (!repositories) {
      return null;
    }

    // Get schemas being used for metadata.
    let schemas = Array.from(new Set(repositories.flatMap((repo) => repo.schemas)));

    // Try to normalize schema URIs to keys that can be looked up.
    schemas = schemas.map((schema) => {
      let slash_index = schema.lastIndexOf('/');
      let dot_index = schema.lastIndexOf('.');

      if (slash_index == -1 || dot_index == -1) {
        return schema;
      }

      return schema.substring(slash_index + 1, dot_index);
    });

    // Make sure the common schema is first so that fields are in order.

    if (schemas.includes('common')) {
      schemas = ['common'].concat(schemas.filter((schema) => schema != 'common'));
    }

    // Map schema field names to elements from surveySchema.
    // Use Map to preserve order.
    let elementMap = new Map();

    for (const schema of schemas) {
      if (!(schema in repositorySchemas)) {
        console.log('Warning: Schema %s not found', schema);
        continue;
      }

      for (const field of repositorySchemas[schema]) {
        let element = elementMap.get(field.name);

        if (!element) {
          // Copy element from surveySchema

          element = surveySchema.elements.find((e) => e.name === field.name);

          if (!element) {
            console.log('Warning: Element %s not found in survey schema', field.name);
            continue;
          }

          element = Object.assign({}, element);
          elementMap.set(field.name, element);

          // Handle readonly fields

          if (readonly && readonly.includes(field.name)) {
            element.readOnly = true;
          }
        }

        // Handle merge of required and requiredIf
        // Give precendence to required

        if ('required' in field && field.required) {
          element.isRequired = true;
          delete element.requiredIf;
        } else if ('requiredIf' in field) {
          if ('requiredIf' in element) {
            console.log('Warning: requireIf merge not supported on %s', field.name);
          }

          element.requiredIf = field.requiredIf;
        }
      }
    }

    let schema = {};
    schema.elements = Array.from(elementMap.values());

    // Add toplevel poperties from surveySchema
    for (const key in surveySchema) {
      if (key != 'elements') {
        schema[key] = surveySchema[key];
      }
    }

    return schema;
  }

  /**
   * Get all field names of a SurveyJS schema.
   *
   * @param {object}  schema
   * @returns {array} list of unique field keys
   */
  getFields(schema) {
    let fields = [];

    schema.elements.forEach((element) => {
      fields.push(element.name);
    });

    return fields;
  }

  /**
   * Get all possible field names.
   *
   * @returns {array} list of all field keys in the survey schema
   */
  getAllFields() {
    return this.getFields(surveySchema);
  }

  /**
   * Return map from field key to field title.
   *
   * @param {array} schemas array of schemas
   */
  getFieldTitleMap(schema) {
    let map = {};

    schema.elements.forEach((element) => {
      map[element.name] = element.title;
    });

    return map;
  }

  /**
   * Get a metadata blob containing information about repository agreements.
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

    repositories
      .filter((repo) => repo.agreementText)
      .forEach((repo) =>
        result.push({
          [repo.name]: repo.agreementText,
        }),
      );

    return {
      agreements: result,
    };
  }

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
  }

  /**
   * Return metadata value for display.
   *
   * @param {*} key
   * @param {*} obj
   */
  _formatMetadata(key, val) {
    if (Array.isArray(val)) {
      return val.map((o) => this._formatComplexMetadataObject(key, o));
    } else if (key === 'publicationDate' && !isNaN(new Date(val))) {
      return new Date(val).toLocaleDateString();
    } else if (typeof val === 'object') {
      return this._formatComplexMetadataObject(key, val);
    } else if (typeof val === 'string') {
      return val;
    }

    return null;
  }

  /**
   * Returns an array of values suitable to display the metadata asscoiated with a
   * submission.
   *
   * @param {*} submission
   * @returns [{label, value, isArray}]
   */
  async displayMetadata(submission) {
    // Metadata keys to display and the order to display them in.
    const whiteList = [
      'authors',
      'abstract',
      'doi',
      'Embargo-end-date',
      'journal-NLMTA-ID',
      'journal-title',
      'journal-title-short',
      'issue',
      'issns',
      'publisher',
      'publicationDate',
      'title',
      'volume',
    ];

    const repos = await submission.repositories;
    const titleMap = this.getFieldTitleMap(surveySchema);
    const metadata = JSON.parse(submission.metadata);

    const result = [];
    if (metadata) {
      whiteList
        .filter((key) => key in metadata)
        .forEach((key) => {
          const value = this._formatMetadata(key, metadata[key]);
          const isArray = Array.isArray(value);

          if (value) {
            result.push({
              label: titleMap[key],
              value,
              isArray,
            });
          }
        });
    }

    return result;
  }
}
