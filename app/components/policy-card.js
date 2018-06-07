import Component from '@ember/component';

export default Component.extend({
  methodAJournal: Ember.computed('journal', function () {
    return this.get('journal.isMethodA');
  }),
  policyIsNIH: Ember.computed('policy', function () {
    return this.get('policy.title') === 'National Institutes of Health Public Access Policy';
  }),
  // checks if the radio buttons need to be displayed
  nihAndNotMethodAJournal: Ember.computed(function () { // eslint-ignore-line
    return this.get('policyIsNIH') && !this.get('methodAJournal');
  }),
  policyIsJHU: Ember.computed(function () { // eslint-ignore-line
    if (this.get('repositories')) {
      return this.get('repositories').any(repo => repo.get('name') === 'JScholarship');
    }
  }),
  didRender() {
    this._super(...arguments);
    if (this.get('methodAJournal') && !this.get('removeNIHDeposit')) {
      this.sendAction('toggleRemoveNIHDeposit', true);
    }
  }
});
