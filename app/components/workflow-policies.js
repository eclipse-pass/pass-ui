import WorkflowComponent from './workflow-component';

export default WorkflowComponent.extend({
  activePolicies: Ember.computed('model.newSubmission', function () {
    let policies = Ember.A();
    // policies can come from funders
    this.get('model.newSubmission.grants').forEach((grant) => {
      if (grant.get('primaryFunder.policy.content')) {
        policies.addObject(grant.get('primaryFunder.policy'));
      }
    });

    // Always add the JHU policy
    let required = this.get('model.policies')
      .filter(repo => repo.get('policyUrl') === 'https://provost.jhu.edu/about/open-access/');
    if (required.length > 0) {
      policies.addObject(required[0]);
    }
    policies = policies.uniqBy('id');
    return policies;
  }),
  actions: {
    next() {
      this.sendAction('toggleNIHDeposit', !(this.get('model.newSubmission.removeNIHDeposit')));
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    setRemoveNIHDeposit(bool) {
      this.set('model.newSubmission.removeNIHDeposit', bool);
    }
  },
});
