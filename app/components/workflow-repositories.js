import Component from '@ember/component';
import { inject as service, } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),
  institutionRepos: Ember.computed('repositories', function () {
    return this.get('repositories').filter(repo => repo.get('repositoryKey') === 'jscholarship');
  }),
  institutionName: Ember.computed(function () {
    return "Johns Hopkins University";
  }),
  pmcPublisherDeposit: Ember.computed('workflow.pmcPublisherDeposit', function () {
    return this.get('workflow').getPmcPublisherDeposit();
  }),
  willRender() {
    this._super(...arguments);
    let workflow = this.get('workflow');
    let institRepo = this.get('institutionRepos')[0];
    if (!workflow.getDefaultRepoLoaded() && institRepo) {
      this.send('addRepository', institRepo);
      workflow.setDefaultRepoLoaded(true);
    }
    //start by synching the submission with what you can see on the page
    this.set('submission.repositories', this.get('combinedRepoList'));
  },
  getFunderNamesForRepo(repo) {
    const funders = this.get('submission.grants').map(grant => grant.get('primaryFunder'));
    const fundersWithRepos = funders.filter(funder => funder.get('policy.repositories'));
    const fundersWithOurRepo = fundersWithRepos.filter(funder => funder.get('policy') &&
      funder.get('policy.repositories') && funder.get('policy.repositories').includes(repo));
    if (fundersWithRepos && fundersWithOurRepo.length > 0) {
      return fundersWithOurRepo.map(funder => funder.get('name'))
        .filter((item, index, arr) => arr.indexOf(item) == index).join(', ');
    }
    return '';
  },
  usesPmcRepository(policyRepos) {
    return policyRepos ? (policyRepos.filter(repo => repo.get('repositoryKey') === 'pmc').length > 0) : false;
  },
  requiredRepositories: Ember.computed('submission.grants','pmcPublisherDeposit', 'optionalRepositories', function () {
    const grants = this.get('submission.grants');
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

      // it's either not a PMC deposit or if it is one, the publisher won't deposit it so it must be included
      if (!this.get('pmcPublisherDeposit') || !this.usesPmcRepository(grantRepos)) {
        grantRepos.forEach((repo) => {
          repos.addObject({
            repo,
            funders: this.getFunderNamesForRepo(repo)
          });
          repos = repos.uniqBy('repo');
        });
      }
    });
    return repos;
  }),
  optionalRepositories: Ember.computed('institutionRepos', 'institutionName', function () {
    let result = Ember.A();
    let institRepos = this.get('institutionRepos');
    let institName = this.get('institutionName');
    institRepos.forEach((repo) => {
      let submissionIncludesRepo = this.get('submission.repositories').includes(repo);
      result.addObject({repo: repo, funders: institName, checked: submissionIncludesRepo});
    });
    return result;
  }),
  combinedRepoList: Ember.computed('optionalRepositories', 'requiredRepositories', function() {
    //this combines the required repositories with those selected in the optional list
    let repos = Ember.A();
    this.get('requiredRepositories').forEach((r) => {
      repos.pushObject(r.repo);
    });
    this.get('optionalRepositories').forEach((r) => {
      if (r.checked) repos.pushObject(r.repo);
    });
    return repos;
  }),
  actions: {
    addRepository(repositoryToAdd) {
      let submissionIncludesRepo = this.get('submission.repositories').includes(repositoryToAdd);
      if (!submissionIncludesRepo) {
        this.get('submission.repositories').pushObject(repositoryToAdd);
      }
      this.get('workflow').setMaxStep(4);
    },
    removeRepository(repositoryToRemove) {
      let addedRepos = this.get('submission.repositories');
      let updatedRepos = Ember.A();
      addedRepos.forEach((repository) => {
        if (repositoryToRemove.get('id') !== repository.get('id')) {
          updatedRepos.pushObject(repository);
        }
      });
      this.set('submission.repositories', updatedRepos);
      this.get('workflow').setMaxStep(4);
    },
    toggleRepository(repository) {
      if (event.target.checked) this.send('addRepository', repository);
      else this.send('removeRepository', repository);
    },
  }
});
