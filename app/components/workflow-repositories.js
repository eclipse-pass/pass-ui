import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';

export default Component.extend({
  addedDeposits: [],

  store: service('store'),
  isFirstTime: true,

  requiredRepositories: Ember.computed('model.repositories', function() {
    const repos = this.get('model.repositories');
    // if (this.isFirstTime) {
    //   repos.forEach((repo) => {
    //     this.send('addRepo', repo);
    //   });
    //   this.isFirsTime = false;
    // }
    return repos;
  }),

  actions: {
    next() {
      this.send('saveAll');
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    addRepo(repository) {
      let submission = this.get('model.newSubmission');

      let deposit = this.get('store').createRecord('deposit', {
        repository,
        status: 'new',
        requested: true
      });
      this.get('addedDeposits').push(deposit);
      console.log("Added deposit:", deposit);
      console.log("Added deposit:", repository.name);
    },
    removeRepo(repository) {
      let deposits = this.get('addedDeposits');
      let i = 0;
      deposits.forEach((deposit, index) => {
        if (deposit.get('repository.id') === repository.get('id')) {
          deposits.splice(index, 1);
        }
      });
    },
    saveAll() {
      console.log('saving all deposits to the submission!');
      var addedDeposits = this.get('addedDeposits');
      var submission = this.get('model.newSubmission');
      addedDeposits.forEach((depositToAdd) => {
        submission.get('deposits').addObject(depositToAdd);
      });
    },
    toggleRepository(repository) {
      if (event.target.checked) {
        this.send('addRepo', repository);
      } else {
        this.send('removeRepo', repository);
      }
    }
  },
  didReceiveAttrs() {
    this._super(...arguments);
  }
});
