import Component from '@ember/component';

export default Component.extend({
  activePolicies: Ember.computed('submission.grants', function () {
    let policies = Ember.A();
    // policies can come from funders
    this.get('submission.grants').forEach((grant) => {
      if (grant.get('primaryFunder.policy.content')) {
        policies.addObject(grant.get('primaryFunder.policy'));
      }
    });

    // Always add the JHU policy
    let required = this.get('policies')
      .filter(repo => repo.get('policyUrl') === 'https://provost.jhu.edu/about/open-access/');
    if (required.length > 0) {
      policies.addObject(required[0]);
    }
    policies = policies.uniqBy('id');
    return policies;
  }),
});
