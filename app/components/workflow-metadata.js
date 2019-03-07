import Component from '@ember/component';
import _ from 'lodash';
import { inject as service } from '@ember/service';

/**
 * Currently, this component will look for ISSN and NLMTA ID data from the DOI data
 * (found in workflow-service.getDoiInfo) into the submission's metadata blob. This
 * is used to pre-populate fields in the metadata forms that will be displayed to
 * the user.
 *
 * The schema service is invoked to retrieve appropriate metadata forms.
 *
 * 'currentSchema' is recalculated every time 'currentFormStep' is changed, which
 * includes when the schemas are initially loaded. During this recalculation, the
 * schema is processed to include any data for fields that we already have information
 * present in the submission metadata blob.
 */
export default Component.extend({
  router: service('router'), // Used to abort this step
  workflow: service('workflow'),
  metadataService: service('metadata-blob'),
  schemaService: service('metadata-schema'),

  doiInfo: Ember.computed('workflow.doiInfo', function () {
    return this.get('workflow').getDoiInfo();
  }),

  // renderGlobalSchema: false,

  /**
   * Schema that is currently being shown to the user
   */
  currentSchema: Ember.computed('schemas', 'currentFormStep', function () {
    const schemas = this.get('schemas');
    if (schemas && schemas.length > 0) {
      const newSchema = this.preprocessSchema(schemas[this.get('currentFormStep')]);
      return newSchema;
    }
  }),
  currentFormStep: 0, // Current step #

  displayFormStep: Ember.computed('currentFormStep', function () {
    return this.get('currentFormStep') + 1;
  }),
  setNextReadonly: true,

  schemas: undefined,

  metadata: {},

  init() {
    this._super(...arguments);
  },

  async willRender() {
    this._super(...arguments);

    // doi:10.1002/0470841559.ch1
    // 10.4137/CMC.S38446
    if (!this.get('schemas')) {
      // Add relevant fields from DOI data to submission metadata
      const doiInfo = this.get('doiInfo');
      this.updateMetadata({
        issns: doiInfo.ISSN,
        'journal-NLMTA-ID': doiInfo.nlmta,
        doi: doiInfo.DOI,
        publisher: doiInfo.publisher,
        'journal-title-short': doiInfo['container-title-short']
      });

      const repos = this.get('submission.repositories').map(repo => repo.get('id'));

      // Load schemas by calling the Schema service
      try {
        const schemas = await this.get('schemaService').getMetadataSchemas(repos);

        this.set('globalSchema', schemas[0]);

        // if (!this.get('renderGlobalSchema')) {
        //   schemas.splice(0, 1); // Remove leading element if it will not be rendered
        // }

        this.set('schemas', schemas);
        this.set('currentFormStep', 0);
      } catch (e) {
        console.log('%cFailed to get schemas', 'color:red;');
        console.log(e);
      }
    }
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
    const service = this.get('schemaService');

    let processed = service.alpacafySchema(schema);

    const metadata = this.get('metadata');
    const readonly = this.get('setNextReadonly');

    return service.addDisplayData(processed, metadata, readonly);
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
      this.get('metadata'),
      newMetadata
    );
    this.set('metadata', mergedBlob);
  },

  /**
   * Do any final processing of the submission's metadata blob here before moving on to the
   * next submission step. The temporary metadata blob stored in this component will be
   * processed and finally saved to the submission object. Processing can include adding or
   * removing appropriate metadata properties.
   */
  finalizeMetadata() {
    this.updateMetadata({
      agent_information: this.getBrowserInfo()
    });

    const finalMetadata = this.get('metadata');

    this.set('submission.metadata', finalMetadata);
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
