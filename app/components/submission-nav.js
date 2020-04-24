import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  workflow: service('workflow'),
  step: computed('workflow.currentStep', function () {
    return this.get('workflow').getCurrentStep();
  }),
  maxStep: computed('workflow.maxStep', function () {
    return this.get('workflow').getMaxStep();
  }),
  displayCovidCheckboxBanner: computed('router.currentRouteName', function () {
    return (!this.router.currentRouteName.includes('submissions.new.files')) && (!this.router.currentRouteName.includes('submissions.new.review'));
  }),
  actions: {
    loadTab(gotoRoute) {
      this.sendAction('loadTab', gotoRoute);
    }
  },
  didRender() {
    this._super(...arguments);
    window.scrollTo(0, 0);
  }
});
