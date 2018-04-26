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
      let repo = grant.get('primaryFunder.policy.repository.content');
      if (grant.get('primaryFunder.policy.content') && repo) {
        if (!(!this.get('includeNIHDeposit') && grant.get('primaryFunder.policy.title') === 'National Institute of Health Public Access Policy')) {
          repos.addObject(repo);
        }
        // else if (this.get('model.newSubmission.repositories').contains(repo)) {
        //   debugger;
        //   this.get('model.newSubmission.repositories').removeObject(repo);
        // }
      }
    });

    // STEP 2
    repos.forEach((repo) => {
      if (!(this.get('addedRepositories').contains(repo))) {
        this.send('addRepo', repo);
      }
    });

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
        if (!((this.get('model.newSubmission.repositories').contains(repositoryToAdd)))) {
          this.get('model.newSubmission.repositories').addObject(repositoryToAdd);
        }
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
