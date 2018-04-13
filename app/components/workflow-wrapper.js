import Component from '@ember/component';
import { storageFor } from 'ember-local-storage';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),
  localSubmission: storageFor('submission'),
  step: 0,
  isValidated: Ember.A(),
  doiInfo: [],
  actions: {
    next() {
      this.incrementProperty('localSubmission.step');
      this.set('localSubmission.submission', this.get('model.newSubmission'));
    },
    back() {
      this.decrementProperty('localSubmission.step');
      this.set('localSubmission.submission', this.get('model.newSubmission'));
    },
    submit() {
      this.sendAction('submit');
    },
    validate() {
      let tempValidateArray = []
      this.set('isValidated', [])
      Object.keys(this.model.toJSON()).forEach((property)=> {
        // TODO:  Add more logic here for better validation
        if(this.model.get(property) !== undefined) {
          tempValidateArray[property] = true
        } else {
          tempValidateArray[property] = false
        }
      })
      this.set('isValidated', tempValidateArray)
      console.log(this.get('isValidated'))
    }
  }
});
