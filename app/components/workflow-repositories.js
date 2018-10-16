import WorkflowComponent from './workflow-component';
import { inject as service, } from '@ember/service';

export default WorkflowComponent.extend({
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
      return fundersWithOurRepo.map(funder => funder.get('name'))
        .filter((item, index, arr) => arr.indexOf(item) == index).join(', ');
    }
    return '';
  },
  requiredRepositories: Ember.computed('model.repositories', function () {
    const grants = this.get('model.newSubmission.grants');
    let repos = Ember.A();
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
      if (shouldAddNIH || funder.get('policy.title').toUpperCase() !== 'NATIONAL INSTITUTES OF HEALTH PUBLIC ACCESS POLICY') {
        grantRepos.forEach((repo) => {
          repos.addObject({
            repo,
            funders: this.getFunderNamesForRepo(repo)
          });
          repos = repos.uniqBy('repo');
        });
      } else if (anyInSubmission) {
        // Remove it from the submission so that it can be re-added :)
        this.get('model.newSubmission.repositories').removeObjects(grantRepos.map(g => g.repo));
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
    repos.forEach(r => result.push({ repo: r, funders: 'Johns Hopkins University' }));
    return result;
  }),
  actions: {
    next() {
      this.send('saveAll');
      if (this.get('model.newSubmission.repositories.length') == 0) {
        swal(
          'You\'re done!',
          'If you don\'t plan on submitting to any repositories, you can stop at this time.',
          { buttons: { cancel: true, confirm: true } },
        ).then((value) => {
          if (value.dismiss) return;
          this.get('router').transitionTo('dashboard');
        });
      } else {
        this.sendAction('next');
      }
    },

    back() { this.sendAction('back'); },
    addRepo(repository) { this.get('addedRepositories').push(repository); },

    removeRepo(targetRepository) {
      const addedRepos = this.get('addedRepositories');
      addedRepos.forEach((repository, index) => {
        if (targetRepository.get('id') === repository.get('id')) addedRepos.splice(index, 1);
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
      if (event.target.checked) this.send('addRepo', repository);
      else this.send('removeRepo', repository);
    },
  },
});
