import Component from '@ember/component';

export default Component.extend({
  didRender() {
    // // TODO:  add validation step here that checks the model each rerender
    // this.set('isValidated', false)

  },
  metadata: Ember.computed('model.newSubmission.metadata', function(){ // eslint-disable-line
    return JSON.parse(this.get('model.newSubmission.metadata'));
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
