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

  currentFormStep: 0, // Current step #

  // Don't think this should be here
  // userIsSubmitter: Ember.computed(this.get(submission.submitter.id) === this.get('currentUser.user.id')),

  currentSchema: {},
  schemas: [],

  init() {
    this._super(...arguments);
    this.set('schemas', []);
  },

  // TODO: Likely we will have nothing to do here
  // Original code copies 'metadataForms' computed property into 'schemas' property
  willRender() {

  },

  actions: {
    nextForm(metadata) {
      const step = this.get('currentFormStep');
      this.updateMetadata(metadata);

      if (this.get('currentFormStep') >= this.get('schemas').length) {
        this.finalizeMetadata(metadata);
        this.sendAction('next');
      } else {
        this.set('currentFormStep', step + 1);
        this.set('currentSchema', this.get('schemas')[step + 1]);
      }
    },

    previousForm(metadata) {
      const step = this.get('currentFormStep');
      if (steps > 0) {
        this.set('currentFormStep', step - 1);
        this.set('currentSchema', this.get('schemas')[step - 1]);
      } else {
        this.sendAction('back');
      }
    },
  },

  /**
   * Add/update data in the current submission metadata blob based on information provided
   * by a user from a metadata form.
   *
   * Impl note:
   * The structure of the 'newMetadata' blob is determined by 'metadata-form.js'. It's
   * metadata is provided to the #nextForm function call.
   *
   * @param {object} newMetadata metadata blob from a single metadata form
   */
  updateMetadata(newMetadata) {

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
