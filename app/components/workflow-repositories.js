import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  addedDeposits: [],

  store: service('store'),

  requiredRepositories: Ember.computed('model.repositories', function() {
    return this.get('model.repositories');
  }),

  actions: {
      next() {
        this.sendAction('next')
      },
      back() {
        this.sendAction('back')
      },
      addRepo(repoName) {
          let submission = this.get('model');

          let deposit = this.get('store').createRecord('deposit', {
              repo: repoName,
              status: 'new',
              requested: true
          });
          submission.get('deposits').pushObject(deposit);
          this.get('addedDeposits').push(deposit);
      },
      saveAll() {
          var deposits = this.get('addedDeposits');
          this.set('addedDeposits', []);
          var submission = this.get('model.newSubmission');
          return Promise.all(deposits.map(deposit => deposit.save()))
              .then(() => submission.save());
      },
  }
  });
