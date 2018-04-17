import Component from '@ember/component';
import { storageFor, } from 'ember-local-storage';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),
  localSubmission: storageFor('submission'),
  store: Ember.inject.service('store'),
  step: 1,
  isValidated: Ember.A(),
  doiInfo: [],
  actions: {
    next() {
      const currentUser = this.get('store').peekRecord('person', this.get('currentUser.user.person.id'));
      const sub = this.get('model.newSubmission');
      sub.save().then((sub) => {
        if (this.get('step') === 2 && sub.get('deposits.length') == 0) { // if the user is leaving the repository section
          let depositsSaved = 0;
          sub.get('deposits').forEach((deposit, index, arr) => {
            deposit.save().then((deposit) => {
              depositsSaved += 1;
              console.log('deposits saved: ', depositsSaved);
              if (depositsSaved === arr.get('length')) {
                this.incrementProperty('step');
              }
            });
          });
        } else if (this.get('step') === 0) { // if the current user doesn't have the submission saved to them yet
          if (currentUser.get('submissionDraft.content') == null) {
            currentUser.set('submissionDraft', sub);
            currentUser.save().then(() => {
              this.incrementProperty('step');
            });
          } else {
            this.incrementProperty('step');
          }
        } else {
          this.incrementProperty('step');
        }
      });
    },
    back() {
      const sub = this.get('model.newSubmission');
      sub.save().then(() => {
        this.decrementProperty('step');
      });
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
      console.log(this.get('isValidated'));
    },
  },
});
