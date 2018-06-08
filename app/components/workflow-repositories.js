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
  router: service(),
  store: service('store'),
  isFirstTime: true,
  willRender() {
    this._super(...arguments);
    this.set('addedRepositories', []);
    if (!(this.get('addedRepositories').findBy('name', 'JScholarship'))) {
      let jScholarships = this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
      this.get('addedRepositories').pushObject(jScholarships[0]);
    }
  },
  requiredRepositories: Ember.computed('model.repositories', function () {
    const grants = this.get('model.newSubmission.grants');
    const repos = Ember.A();
    grants.forEach((grant) => {
      // let repo = grant.get('primaryFunder.policy.repositories.content');
      if (grant.get('primaryFunder').content) {
        let grepos = grant.get('primaryFunder.policy.repositories');
        if (grepos && grepos.length > 0) { // A Funder may not have a Policy
          let anyInSubmission = grepos.any(grantRepo => this.get('model.newSubmission.repositories').contains(grantRepo));

          if (grant.get('primaryFunder.policy.content') && grepos) {
            // NOT( (Don't include NIH deposit) AND (funder policy IS the NIH policy) )
            if (!(!this.get('includeNIHDeposit') && grant.get('primaryFunder.policy.title') === 'National Institutes of Health Public Access Policy')) {
              grepos.forEach(r => repos.addObject(r));
            } else if (anyInSubmission) {
              // If the new submission already has the repositories for this grant
              // Remove those repositories (they are added back later)
              this.get('model.newSubmission.repositories').removeObjects(grepos);
            }
          }
        }
      }
    });
    // STEP 2
    repos.forEach((repo) => {
      this.send('addRepo', repo);
    });

    // STEP 3
    return repos;
  }),
  optionalRepositories: Ember.computed('requiredRepositories', function () {
    let repos = this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
    if (repos.length > 1) {
      repos = [repos[0]];
    }
    return repos;
  }),
  didRender() {
    this._super(...arguments);
  },
  actions: {
    next() {
      this.send('saveAll');
      const that = this;
      if (this.get('model.newSubmission.repositories.length') == 0) {
        swal(
          'You\'re done!',
          'If you don\'t plan on submitting to any repositories, you can stop at this time.',
          {
            buttons: {
              cancel: true,
              confirm: true,
            }
          },
        ).then((value) => {
          if (value.dismiss) {
            return;
          }
          this.get('router').transitionTo('dashboard');
        });
      } else {
        this.sendAction('next');
      }
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
      // remove all repos from submission
      let tempRepos = this.get('model.newSubmission.repositories');
      this.get('model.newSubmission.repositories').forEach((repo) => {
        tempRepos.removeObject(repo);
      });
      this.set('model.newSubmission.repositories', tempRepos);
      // add back the ones the user selected
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
});
