import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),
  step: Ember.computed('workflow.currentStep', function () {
    return this.get('workflow').getCurrentStep();
  }),
  maxStep: Ember.computed('workflow.maxStep', function () {
    return this.get('workflow').getMaxStep();
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
