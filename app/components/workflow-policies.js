import Component from '@ember/component';

export default Component.extend({
  removeNIHDeposit: false,
  activePolicies: Ember.computed('model.newSubmission', function () {
    // policies can come from repositories  // UPDATE: not anymore!
    // const repos = [];
    let policies = Ember.A();
    // this.get('model.newSubmission.repositories').forEach((repository) => {
    //   repos.addObject(repository);
    // });
    // policies can come from funders
    this.get('model.newSubmission.grants').forEach((grant) => {
      // repos.addObject(grant.get('primaryFunder.repository'));
      if (grant.get('primaryFunder.policy.content')) {
        policies.addObject(grant.get('primaryFunder.policy'));
      }
    });
    // repos.forEach((repository) => {
    //   policies.addObject(repository.get('policy'));
    // });
    policies = policies.uniqBy('id');
    return policies;
  }),

  // checks if the radio buttons need to be displayed
  nihAndNotMethodAJournal: Ember.computed('model.publication.journal', 'activePolicies', function () { // eslint-ignore-line
    let nih = false;
    let methodA = this.get('model.publication.journal.isMethodA');
    if (methodA) {
      return false;
    }
    this.get('activePolicies').forEach((policy) => {
      if (policy.get('title') === 'National Institute of Health Public Access Policy') {
        nih = true;
      }
    });
    return nih && !methodA;
  }),
  actions: {
    next() {
      this.sendAction('toggleNIHDeposit', !(this.get('removeNIHDeposit')));
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
  },
});
