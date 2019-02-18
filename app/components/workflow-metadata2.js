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
    nextForm() {
      this.send('nextLogic');
    },

    nextLogic() {
      const step = this.get('currentFormStep');

      if (this.get('currentFormStep') >= this.get('schemas').length) {
        // TODO: finalize metadata blob and set 'submission.metadata'
        this.sendAction('next');
      } else {
        this.set('currentFormStep', step + 1);
        this.set('currentSchema', this.get('schemas')[step + 1]);
      }
    },

    previousForm() {
      const step = this.get('currentFormStep');
      if (steps > 0) {
        this.set('currentFormStep', step - 1);
        this.set('currentSchema', this.get('schemas')[step - 1]);
      } else {
        this.sendAction('back');
      }
    },

    /**
     * I _think_ we can ignore this. It seems to shuffle and copy author information to various
     * places of the final metadata blob. Since the new blob will be flattened, it should no
     * matter.
     */
    checkForAuthors() {}
  }
});
