import Component from '@ember/component';

export default Component.extend({
  currentUser: Ember.inject.service('current-user'),
  store: Ember.inject.service('store'),
  step: 1,
  maxStep: 1,
  isValidated: Ember.A(),
  doiInfo: [],
  includeNIHDeposit: true,
  comments: Ember.A([{
    dateTime: 'date',
    message: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae ',
    user: {
      username: 'nih-user@johnshopkins.edu',
      displayName: 'Nihu Ser',
      firstName: 'Alfredo',
      lastName: 'Kirkwood',
      email: 'nihuser@jhu.edu',
      institutionalId: 'nih-user',
      roles: ['submitter']
    }
  }]),
  init() {
    this._super(...arguments);
    this.set('filesTemp', Ember.A());
  },
  userIsPreparer: Ember.computed('currentUser.user', 'model.newSubmission', function () {
    return this.get('model.newSubmission.preparers').includes(this.get('currentUser.user'));
  }),
  userIsSubmitter: Ember.computed('currentUser.user', 'model.newSubmission', function () {
    return this.get('model.newSubmission.submitter') === this.get('currentUser.user');
  }),
  actions: {
    toggleNIHDeposit(bool) {
      this.set('includeNIHDeposit', bool);
    },
    next() {
      let currentUser = this.get('currentUser.user');
      this.incrementProperty('step');
      if (this.get('maxStep') < this.get('step')) {
        this.set('maxStep', this.get('step'));
      }
    },
    back() {
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
    addComment(comment) {
      this.comments.unshiftObject(comment);
      console.log(this.get('comments'));
    },
    saveComment(values) {
      this.comments[values[0]] = values[1];
    },
    deleteComment(index) {
      console.log('delete', index)
      this.comments.removeAt(index)
    },
  },
});
