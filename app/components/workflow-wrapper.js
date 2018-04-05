import Component from '@ember/component';

export default Component.extend({
  step: 1,
  isValidated: Ember.A(),
  actions: {
    next() {
      this.set('step', this.get('step') + 1);
    },
    back() {
      this.set('step', this.get('step') - 1);
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
