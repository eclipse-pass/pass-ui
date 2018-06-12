import Component from '@ember/component';
import { inject as service, } from '@ember/service';
import EmberArray from '@ember/array';

// function diff(array1, array2) {
//   const retArray = [];
//   array1.forEach((element1) => {
//     let flag = false;
//     array2.forEach((element2) => {
//       if (element1.get('id') === element2.get('id')) {
//         flag = true;
//       }
//     });
//     if (!flag) {
//       retArray.push(element1);
//     }
//   });
//   return retArray;
// }
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
  getFunderNamesForRepo(repo) {
    const funders = this.get('model.newSubmission.grants').map(grant => grant.get('primaryFunder'));
    const fundersWithRepos = funders.filter(funder => funder.get('policy.repositories'));
    const fundersWithOurRepo = fundersWithRepos.filter(funder => funder.get('policy') &&
      funder.get('policy.repositories') && funder.get('policy.repositories').includes(repo));
    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo.map(funder => funder.get('name')).join(', ');
    }
    return '';
  },
  requiredRepositories: Ember.computed('model.repositories', function () {
    const grants = this.get('model.newSubmission.grants');
    const repos = Ember.A();
    grants.forEach((grant) => {
      const funder = grant.get('primaryFunder');
      if (!funder.content || !funder.get('policy')) {
        return;
      }

      // Grant has funder and that funder has a policy. Get the repositories tied to the policy
      const grantRepos = funder.get('policy.repositories');
      if (!grantRepos || grantRepos.length == 0) {
        return;
      }

      const shouldAddNIH = this.get('includeNIHDeposit');
      let anyInSubmission = grantRepos.any(grantRepo => this.get('model.newSubmission.repositories').includes(grantRepo));
      if (shouldAddNIH || !funder.get('policy.title').toUpperCase() === 'National Institutes of Health Public Access Policy') {
        grantRepos.forEach(repo => repos.addObject({
          repo,
          funders: this.getFunderNamesForRepo(repo)
        }));
      } else if (anyInSubmission) {
        // Remove it from the submission so that it can be re-added :)
        this.get('model.newSubmission.repositories').removeObjects(grantRepos);
      }
    });
    // STEP 2
    repos.forEach((repo) => {
      this.send('addRepo', repo.repo);
    });

    // STEP 3
    return repos;
  }),
  optionalRepositories: Ember.computed('requiredRepositories', function () {
    let repos = this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
    if (repos.length > 1) {
      repos = [repos[0]];
    }
    let result = [];
    repos.forEach(r => result.push({
      repo: r,
      // funders: this.getFunderNamesForRepo(r)
      funders: 'Johns Hopkins University'
    }));
    return result;
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
        if (!((this.get('model.newSubmission.repositories').includes(repositoryToAdd)))) {
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
