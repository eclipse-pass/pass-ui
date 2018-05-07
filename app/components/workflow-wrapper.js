import Component from '@ember/component';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  step: 1,
  maxStep: 1,
  isValidated: Ember.A(),
  doiInfo: [],
  includeNIHDeposit: true,
  actions: {
    toggleNIHDeposit(bool) {
      this.set('includeNIHDeposit', bool);
    },
    next() {
      let currentUser = this.get('currentUser.user');
      // const submission = this.get('model.newSubmission');
      // submission.save().then((sub) => {
      //   if (this.get('step') === 1) { // if the current user doesn't have the submission saved to them yet
      //     if (currentUser.get('submissionDraft.content') == null) {
      //       currentUser.set('submissionDraft', sub);
      //       currentUser.save().then(() => {
      //         this.incrementProperty('step');
      //       });
      //     } else {
      //       this.incrementProperty('step');
      //     }
      //   } else {
      //     this.incrementProperty('step');
      //   }
      // });
      this.incrementProperty('step');
      if (this.get('maxStep') < this.get('step')) {
        this.set('maxStep', this.get('step'));
      }
    },
    back() {
      // const sub = this.get('model.newSubmission');
      // sub.save().then(() => {
      //   this.decrementProperty('step');
      // });
      this.decrementProperty('step');
    },
    submit() {
      this.sendAction('submit');
    },
    validate() {
      const tempValidateArray = [];
      this.set('isValidated', []);
      Object.keys(this.get('model.newSubmission').toJSON()).forEach((property) => {
        // TODO:  Add more logic here for better validation
        if (this.get('model.newSubmission').get(property) !== undefined) {
          tempValidateArray[property] = true;
        } else {
          tempValidateArray[property] = false;
        }
      });
      this.set('isValidated', tempValidateArray);
    },
  },
});
