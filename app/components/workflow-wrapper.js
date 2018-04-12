import Component from '@ember/component';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),
  step: 1,
  isValidated: Ember.A(),
  doiInfo: [],
  actions: {
    next() {
      this.set('currentUser.step', this.get('step') + 1);
      this.set('step', this.get('step') + 1);
    },
    back() {
      this.set('currentUser.step', this.get('step') - 1);
      this.set('step', this.get('step') - 1);
    },
    submit() {
      console.log('Received action. Sending to route from wrapper...');
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
