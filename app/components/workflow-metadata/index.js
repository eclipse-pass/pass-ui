/* eslint-disable ember/no-get */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import swal from 'sweetalert2';
import { task } from 'ember-concurrency';

/**
 * The schema service is invoked to retrieve appropriate metadata forms.
 *
 * 'currentSchema' is recalculated every time 'currentFormStep' is changed, which
 * includes when the schemas are initially loaded. During this recalculation, the
 * schema is processed to include any data for fields that we already have information
 * present in the submission metadata blob.
 *
 * When a user first enters this step, metadata is pulled from the known DOI blob, if
 * one exists. That metadata is processed to be compliant with known schemas. This becomes
 * the submission metadata blob. Form fields for each metadata schema are prepopulated
 * using the submission metadata. After each form, all of the input fields are grabbed
 * from the metadata forms and used to update the submission metadata, making the values
 * available to autofill subsequent forms.
 */
export default class WorkflowMetadata extends Component {
  @service currentUser;
  @service router; // Used to abort this step
  @service workflow;
  @service metadataSchema;
  @service doi;

  @tracked doiInfo = this.workflow.doiInfo;
  @tracked readOnlyProperties = [];
  @tracked schemas = undefined;
  @tracked metadata = {};
  @tracked currentFormStep = 0; // Current step #

  /**
   * Schema that is currently being shown to the user
   */

  get currentSchema() {
    const schemas = this.schemas;
    if (schemas && schemas.length > 0) {
      const newSchema = this.preprocessSchema(schemas[this.currentFormStep]);
      return newSchema;
    }
    return false;
  }

  get onlySingleSchema() {
    return this.schemas.length === 1;
  }

  get displayFormStep() {
    return this.currentFormStep + 1;
  }

  constructor() {
    super(...arguments);

    let md;
    try {
      md = JSON.parse(get(this, 'args.submission.metadata'));
    } catch (e) {
      // console.log(e);
      // Do nothing
    } finally {
      set(this, 'metadata', md || {});
      this.setReadOnly({});
    }
  }

  setupSchemas = task(async () => {
    // doi:10.1002/0470841559.ch1
    // 10.4137/CMC.S38446
    // 10.1039/c7an01256j
    if (!this.schemas) {
      const repos = get(this, 'args.submission.repositories').map((repo) => repo.id);

      // Load schemas by calling the Schema service
      try {
        const schemas = await this.metadataSchema.getMetadataSchemas(repos);

        const doiInfo = this.doiInfo;
        const journal = await get(this, 'args.publication.journal');

        // Add relevant fields from DOI data to submission metadata
        const metadataFromDoi = this.doi.doiToMetadata(doiInfo, journal, this.metadataSchema.getFields(schemas));

        if (this.workflow.isDataFromCrossref()) {
          this.setReadOnly(metadataFromDoi);
        }

        this.updateMetadata(metadataFromDoi);

        set(this, 'schemas', schemas);
        set(this, 'currentFormStep', 0);
      } catch (e) {
        console.log('%cFailed to get schemas', 'color:red;');
        console.log(e);
      }
    }
  });

  /**
   * Set the object keys as read-only metadata fields. This assumes that incoming metadata captured
   * before this component is reached is read-only such as Crossref metadata or title/journal
   * from the first step of the workflow
   *
   * @param {object} metadata
   */
  setReadOnly(metadata) {
    set(this, 'readOnlyProperties', Object.keys(metadata));
  }

  @action
  nextForm(metadata) {
    const step = this.currentFormStep;
    this.updateMetadata(metadata, true);
    this.hintsCleanup();

    const metadataSchema = this.metadataSchema;
    const schema = this.schemas[this.currentFormStep];

    const validation = metadataSchema.validate(schema, this.metadata);

    if (!validation) {
      console.log('%cError(s) found while validating data', 'color:red;');
      console.log(metadataSchema.getErrors());

      swal({
        type: 'error',
        title: 'Form Validation Error',
        html: this.validationErrorMsg(metadataSchema.getErrors()),
      });
      return;
    }

    if (step >= this.schemas.length - 1) {
      this.finalizeMetadata(metadata);
      this.args.next();
    } else {
      this.currentFormStep = step + 1; // Changing step # will update current schema
    }
  }

  @action
  previousForm(metadata) {
    const step = this.currentFormStep;
    if (step > 0) {
      this.currentFormStep = step - 1; // Changing step # will update current schema
    } else {
      this.args.back();
    }
  }

  @action
  cancel() {
    this.args.abort();
  }

  /**
   * Process schema before displaying it to the user. Tasks during processing includes pre-populating
   * appropriate data fields from current metadata, setting read-only fields, etc.
   *  - Remove title of schema if there is only a single one to display
   */
  preprocessSchema(schema) {
    const service = this.metadataSchema;

    if (this.onlySingleSchema) {
      schema = service.untitleSchema(schema);
    }

    let processed = service.alpacafySchema(schema);

    const metadata = this.metadata;
    const readonly = this.readOnlyProperties;

    return service.addDisplayData(processed, metadata, readonly);
  }

  /**
   * Add/update data in the current submission metadata blob based on information provided
   * by a user from a metadata form. New metadata will be merged with the current metadata
   * blob.
   *
   * Impl note:
   * - The structure of the 'newMetadata' blob is determined by 'components/metadata-form.js'. Its
   * metadata is provided to the #nextForm function call.
   * - Merging current and new blobs together is done in 'services/metadata-schema.js'
   *
   * @param {object} newMetadata metadata blob from a single metadata form
   * @param {boolean} allowDelete let the blob merge delete fields
   */
  updateMetadata(newMetadata, allowDelete) {
    let mergedBlob;

    let deletableFields;

    /**
     * TODO: We need a comprehensive definition of how to merge metadata blobs.
     * The current implementation does not work! For example, it will not allow
     * the deletion of data, so if a user removes some info from a metadata form,
     * it will not be removed from the blob :(
     */

    if (allowDelete) {
      /**
       * For field deletion, we should look at what fields are displayed in the current schema
       * then for each of those fields, if no value is present, remove that key from the
       * metadata blob. Using 'rendered' fields as valid deletable fields should work around
       * the need to explicitly ignore '$schema'
       */
      deletableFields = this.metadataSchema.getFields([this.currentSchema], true);
    }

    mergedBlob = this.metadataSchema.mergeBlobs(this.metadata, newMetadata, deletableFields);

    set(this, 'metadata', mergedBlob);
  }

  /**
   * Do any final processing of the submission's metadata blob here before moving on to the
   * next submission step. The temporary metadata blob stored in this component will be
   * processed and finally saved to the submission object. Processing can include adding or
   * removing appropriate metadata properties.
   *
   * This should only be called once before the app transitions to the next workflow step.
   *
   * IMPL NOTE:
   * The final metadata blob will include some extra data sourced from outside the metadata
   * forms, include (browser) agent info.
   */
  finalizeMetadata() {
    this.updateMetadata({
      agent_information: this.getBrowserInfo(),
    });

    const finalMetadata = this.metadata;
    set(this, 'args.submission.metadata', JSON.stringify(finalMetadata));
  }

  /**
   * cleans up metadata before it is validated to align it with the submission
   * model metadata field which is mutated by the covid selection box
   */
  hintsCleanup() {
    let submission = get(this, 'args.submission');
    let metadata = get(this, 'metadata');
    let tags = [];
    let mdHasCovid = false;

    if ('hints' in metadata) {
      tags = metadata.hints['collection-tags'];
      mdHasCovid = tags.includes('covid');
    }

    if (mdHasCovid && !submission.isCovid) {
      if (tags.length > 1) {
        let tagsWithoutCovid = tags.filter((tag) => tag != 'covid');
        metadata.hints['collection-tags'] = tagsWithoutCovid;
      }

      if (tags.length === 1) {
        delete metadata.hints;
      }
    }

    if (!mdHasCovid && submission.isCovid) {
      if ('hints' in metadata) {
        metadata.hints['collection-tags'].push('covid');
      } else {
        metadata.hints = {
          'collection-tags': ['covid'],
        };
      }
    }
  }

  /**
   * Used to set some information in the metadata blob
   */
  getBrowserInfo() {
    let ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE ', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    //  eslint-disable-next-line
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1],
    };
  }

  validationErrorMsg(errors) {
    let msg = '<ul>';
    errors.forEach((error) => {
      msg += `<li>${error.message}</li>`;
    });
    msg += '</ul>';

    return msg;
  }
}
