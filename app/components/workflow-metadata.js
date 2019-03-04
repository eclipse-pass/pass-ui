import Component from '@ember/component';
import _ from 'lodash';
import { inject as service } from '@ember/service';

/**
 * TODO: We might have to invoke the Schema service during #init to grab the list of schemas.
 * If we do, we will have to do some processing to set values for fields retreived from the
 * submission's DOI and make sure they are presented to the user as read-only (not editable)
 * fields.
 */
export default Component.extend({
  router: service('router'), // Used to abort this step
  workflow: service('workflow'),
  metadataService: service('metadata-blob'),
  schemaService: service('metadata-schema'),

  doiInfo: Ember.computed('workflow.doiInfo', function () {
    return this.get('workflow').getDoiInfo();
  }),

  /**
   * Schema that is currently being shown to the user
   */
  currentSchema: Ember.computed('schemas', 'currentFormStep', function () {
    const schemas = this.get('schemas');
    if (schemas && schemas.length > 0) {
      return this.preprocessSchema(schemas[this.get('currentFormStep')]);
    }
  }),
  currentFormStep: 0, // Current step #

  displayFormStep: Ember.computed('currentFormStep', function () {
    return this.get('currentFormStep') + 1;
  }),

  schemas: [],

  async init() {
    this._super(...arguments);
    const repos = this.get('submission.repositories');

    try {
      const schemas = await this.get('schemaService').getMetadataSchemas(repos);
      this.set('schemas', schemas);
      this.set('currentFormStep', 0);
    } catch (e) {
      console.log('%cFailed to get schemas', 'color:red;');
      console.log(e);
    }
  },

  // TODO: Likely we will have nothing to do here
  // Original code copies 'metadataForms' computed property into 'schemas' property
  willRender() {

  },

  actions: {
    nextForm(metadata) {
      const step = this.get('currentFormStep');
      this.updateMetadata(metadata);

      if (step >= this.get('schemas').length) {
        this.finalizeMetadata(metadata);
        this.sendAction('next');
      } else {
        this.set('currentFormStep', step + 1); // Changing step # will update current schema
        // TODO: Add display data / set read-only fields here?
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
  },

  /**
   * Process schema before displaying it to the user. Tasks during processing includes pre-populating
   * appropriate data fields from current metadata, setting read-only fields, etc.
   */
  preprocessSchema(schema) {
    const metadata = this.get('submission.metadata');

    return this.get('schemaService').addDisplayData(schema, metadata);
  },

  /**
   * Add/update data in the current submission metadata blob based on information provided
   * by a user from a metadata form. New metadata will be merged with the current metadata
   * blob.
   *
   * Impl note:
   * - The structure of the 'newMetadata' blob is determined by 'components/metadata-form.js'. It's
   * metadata is provided to the #nextForm function call.
   * - Merging current and new blobs together is done in 'services/metadata-blob.js'
   *
   * @param {object} newMetadata metadata blob from a single metadata form
   */
  updateMetadata(newMetadata) {
    const mergedBlob = this.get('metadataService').mergeBlobs(
      this.get('submission.metadata'),
      newMetadata
    );

    this.set('submission.metadata', mergedBlob);
  },

  /**
   * Do any final processing of the submission's metadata blob here before moving on to the
   * next submission step.
   */
  finalizeMetadata() {
    let metadata = this.get('submission.metadata');

    metadata.set('agent_information', this.getBrowserInfo());
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
  }
});
