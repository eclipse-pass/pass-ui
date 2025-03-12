/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get, ember/no-string-prototype-extensions */
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import testSchema from './schema/test.json';

/**
 * Service to manipulate metadata formschemas
 */

export default class MetadataSchemaService extends Service {
  constructor() {
    super(...arguments);
  }

  /**
   * TODO implement
   *
   * @param {array} repositories list of repository URIs
   * @param {array} readonly list of properties that should be marked as read-only
   * @returns schema relevant to the given repositories
   */
  getMetadataSchema(repositories, readonly) {
    if (!repositories) {
      return null;
    }

    // TODO Set isReadonly
    // Merge and set isRequired

    return testSchema;
  }

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
    // schema.mergeData(data);

    // TODO handle readonly

    return schema;
  }

  /**
   * Get all unique field names across a set of schema. This includes any unique field
   * in schema referenced in the 'allOf' validation sections, unless otherwise specified.
   *
   * @param {object}  schema
   * @returns {array} list of unique field keys
   */
  getFields(schema) {
    let fields = [];

    schema.elements.forEach((element) => {
      if (!fields.includes(element.name)) {
        fields.push(element.name);
      }
    });

    return fields;
  }

  // TODO work off global schema...
  getAllFields() {
    return this.getFields(testSchema);
  }

  /**
   * Return map from field key to field title. Use title from the schema or
   * just munge the key. Fields from additional schemas in `schema.allOf`
   * should be added to the map as well.
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
    const schema = this.getMetadataSchema(repos);
    const titleMap = this.getFieldTitleMap(schema);
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
