import Component from '@ember/component';
import { inject as service, } from '@ember/service';
import EmberArray from '@ember/array';

function diff(array1, array2) {
  const retArray = [];
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
  addedRepositories: [],

  store: service('store'),
  isFirstTime: true,

  requiredRepositories: Ember.computed('model.repositories', function () {
    const grants = this.get('model.newSubmission.grants');
    const repos = Ember.A();
    grants.forEach((grant) => {
      if (grant.get('primaryFunder.policy.content') && grant.get('primaryFunder.policy.repository.content')) {
        repos.addObject(grant.get('primaryFunder.policy.repository.content'));
      }
    });

    // STEP 2
    if (this.isFirstTime) {
      repos.forEach((repo) => {
        this.send('addRepo', repo);
      });
      this.isFirstTime = false;
    }

    // STEP 3
    return repos;
  }),

  optionalRepositories: Ember.computed('requiredRepositories', function () {
    // const allRepos = this.get('model.repositories');
    // const reqRepos = this.get('requiredRepositories');
    // const ret = diff(allRepos, reqRepos).concat(diff(reqRepos, allRepos));
    // return ret;
    return this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
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
      this.get('addedRepositories').push(repository);
    },
    removeRepo(targetRepository) {
      const repositories = this.get('addedRepositories');
      repositories.forEach((repository, index) => {
        if (targetRepository.get('id') === repository.get('id')) {
          repositories.splice(index, 1);
        }
      });
    },
    saveAll() {
      this.get('addedRepositories').forEach((repositoryToAdd) => {
        this.get('model.newSubmission.repositories').addObject(repositoryToAdd);
      });
    },
    toggleRepository(repository) {
      if (event.target.checked) {
        this.send('addRepo', repository);
      } else {
        this.send('removeRepo', repository);
      }
    },
  },
  didReceiveAttrs() {
    this._super(...arguments);
  },
});
