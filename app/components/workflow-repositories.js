import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import EmberArray from '@ember/array';

function diff(array1, array2) {
  let retArray = [];
  array1.forEach((element1) => {
    let flag = false;
    array2.forEach((element2) => {
      if (element1.get('id') === element2.get('id')) {
        flag = true;
      }
    });
    if (!flag) {
      retArray.push(element1);
    }
  });
  return retArray;
}
export default Component.extend({
  addedDeposits: [],

  store: service('store'),
  isFirstTime: true,

  requiredRepositories: Ember.computed('model.repositories', function() {
    let grants = this.get('model.newSubmission.grants');
    let repos = []
    grants.forEach((grant) => {
      repos.addObject(grant.get('funder.repository'));
    });

    // STEP 2
    if (this.isFirstTime) {
      repos.forEach((repo) => {
        this.send('addRepo', repo);
      });
      this.isFirsTime = false;
    }

    // STEP 3
    return repos;
  }),

  optionalRepositories: Ember.computed('requiredRepositories', function() {
    let allRepos = this.get('model.repositories');
    let reqRepos = this.get('requiredRepositories')
    const ret = diff(allRepos, reqRepos).concat(diff(reqRepos, allRepos));
    return ret;
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
        status: 'NEW',
        isRequired: true
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
