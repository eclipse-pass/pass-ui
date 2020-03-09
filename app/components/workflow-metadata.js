import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import swal from 'sweetalert2';

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
export default Component.extend({
  currentUser: service('current-user'),
  router: service('router'), // Used to abort this step
  workflow: service('workflow'),
  schemaService: service('metadata-schema'),

  doiInfo: computed('workflow.doiInfo', function () {
    return this.get('workflow').getDoiInfo();
  }),
  doiService: service('doi'),

  /**
   * Schema that is currently being shown to the user
   */
  currentSchema: computed('schemas', 'currentFormStep', function () {
    const schemas = this.get('schemas');
    if (schemas && schemas.length > 0) {
      const newSchema = this.preprocessSchema(schemas[this.get('currentFormStep')]);
      return newSchema;
    }
  }),
  currentFormStep: 0, // Current step #

  onlySingleSchema: computed('schemas', function () {
    return this.get('schemas').length === 1;
  }),

  displayFormStep: computed('currentFormStep', function () {
    return this.get('currentFormStep') + 1;
  }),

  // setNextReadonly: false,
  readOnlyProperties: [],

  schemas: undefined,

  metadata: {},

  init() {
    this._super(...arguments);

    let md;
    try {
      md = JSON.parse(this.get('submission.metadata'));
    } catch (e) {
      // Do nothing
    } finally {
      this.set('metadata', md || {});
      this.setReadOnly({});
    }
  },

  async willRender() {
    this._super(...arguments);

    // doi:10.1002/0470841559.ch1
    // 10.4137/CMC.S38446
    // 10.1039/c7an01256j
    if (!this.get('schemas')) {
      const repos = this.get('submission.repositories').map(repo => repo.get('id'));

      // Load schemas by calling the Schema service
      try {
        const schemas = await this.get('schemaService').getMetadataSchemas(repos);

        const doiInfo = this.get('doiInfo');
        const journal = await this.get('publication.journal');

        // Add relevant fields from DOI data to submission metadata
        const metadataFromDoi = this.get('doiService').doiToMetadata(
          doiInfo,
          journal,
          this.get('schemaService').getFields(schemas)
        );

        if (this.get('workflow').isDataFromCrossref()) {
          this.setReadOnly(metadataFromDoi);
        }

        this.updateMetadata(metadataFromDoi);

        this.set('schemas', schemas);
        this.set('currentFormStep', 0);
      } catch (e) {
        console.log('%cFailed to get schemas', 'color:red;');
        console.log(e);
      }
    }
  },

  /**
   * Set the object keys as read-only metadata fields. This assumes that incoming metadata captured
   * before this component is reached is read-only such as Crossref metadata or title/journal
   * from the first step of the workflow
   *
   * @param {object} metadata
   */
  setReadOnly(metadata) {
    this.set('readOnlyProperties', Object.keys(metadata));
  },

  actions: {
    nextForm(metadata) {
      const step = this.get('currentFormStep');
      this.updateMetadata(metadata, true);

      const schemaService = this.get('schemaService');
      const schema = this.get('schemas')[this.get('currentFormStep')];

      const validation = schemaService.validate(schema, this.get('metadata'));

      if (!validation) {
        console.log('%cError(s) found while validating data', 'color:red;');
        console.log(schemaService.getErrors());

        swal({
          type: 'error',
          title: 'Form Validation Error',
          html: this.validationErrorMsg(schemaService.getErrors())
        });
        return;
      }

      if (step >= this.get('schemas').length - 1) {
        this.finalizeMetadata(metadata);
        this.sendAction('next');
      } else {
        this.set('currentFormStep', step + 1); // Changing step # will update current schema
      }
    },

    previousForm(metadata) {
      const step = this.get('currentFormStep');
      if (step > 0) {
        this.set('currentFormStep', step - 1); // Changing step # will update current schema
      } else {
        this.sendAction('back');
      }
    },

    cancel() {
      this.sendAction('abort');
    }
  },

  /**
   * Process schema before displaying it to the user. Tasks during processing includes pre-populating
   * appropriate data fields from current metadata, setting read-only fields, etc.
   *  - Remove title of schema if there is only a single one to display
   */
  preprocessSchema(schema) {
    const service = this.get('schemaService');

    if (this.get('onlySingleSchema')) {
      schema = service.untitleSchema(schema);
    }

    let processed = service.alpacafySchema(schema);

    const metadata = this.get('metadata');
    const readonly = this.get('readOnlyProperties');

    return service.addDisplayData(processed, metadata, readonly);
  },

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
      deletableFields = this.get('schemaService').getFields([this.get('currentSchema')], true);
    }

    mergedBlob = this.get('schemaService').mergeBlobs(
      this.get('metadata'),
      newMetadata,
      deletableFields
    );

    this.set('metadata', mergedBlob);
  },

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
      agent_information: this.getBrowserInfo()
    });

    const finalMetadata = this.get('metadata');
    this.set('submission.metadata', JSON.stringify(finalMetadata));
  },

  /**
   * Used to set some information in the metadata blob
   */
  getBrowserInfo() {
    let ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE ', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    //  eslint-disable-next-line
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
  },

  validationErrorMsg(errors) {
    let msg = '<ul>';
    errors.forEach((error) => {
      msg += `<li>${error.message}</li>`;
    });
    msg += '</ul>';

    return msg;
  }
});
