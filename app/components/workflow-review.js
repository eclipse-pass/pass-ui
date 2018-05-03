import Component from '@ember/component';

export default Component.extend({
  didRender() {
    // // TODO:  add validation step here that checks the model each rerender
    // this.set('isValidated', false)
  },
  metadata: Ember.computed('model.newSubmission.metadata', function(){ // eslint-disable-line
    return JSON.parse(this.get('model.newSubmission.metadata'));
  }),
  metadataBlobNoKeys: Ember.computed('model.newSubmission.metadata', function(){ // eslint-disable-line
    let metadataBlobNoKeys = [];
    JSON.parse(this.get('model.newSubmission.metadata')).forEach((ele) => {
      for (var key in ele.data) {
        if (ele.data.hasOwnProperty(key)) {
          metadataBlobNoKeys[key] = ele.data[key];
        }
      }
    });
    return metadataBlobNoKeys;
  }),
  actions: {
    submit() {
      this.sendAction('submit');
    },
    back() {
      this.sendAction('back');
    },
    checkValidate() {
      this.sendAction('validate');
    },
  }
});
