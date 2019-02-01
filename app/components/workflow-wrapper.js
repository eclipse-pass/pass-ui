import Component from '@ember/component';

export default Component.extend({
  actions: {
    loadTab(gotoRoute) {
      this.sendAction('loadTab', gotoRoute);
    }
  }
});
