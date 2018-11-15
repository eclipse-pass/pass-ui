import Component from '@ember/component';

export default Component.extend({
  // checks if the radio buttons need to be displayed
  usesPmcRepository: Ember.computed('policy.repositories', function () {
    return this.get('policy.repositories') ? (this.get('policy.repositories').filter(repo => repo.get('repositoryKey') === 'pmc').length > 0) : false;
  }),
  methodAJournal: Ember.computed('journal', function () {
    return this.get('journal.isMethodA');
  }),
  policyIsJHU: Ember.computed(function () { // eslint-ignore-line
    return this.get('policy.title') === 'Johns Hopkins University (JHU) Open Access Policy';
  }),
  didRender() {
    this._super(...arguments);
    if (this.get('methodAJournal') && !this.get('removeNIHDeposit')) {
      this.sendAction('toggleRemoveNIHDeposit', true);
    }
  }
});
