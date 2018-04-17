import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  allRepos: ['PMC', 'NSF-PAR', 'DOE-PAGES', 'JHU-IR', 'JHU-AR'],
  addedDeposits: [],
  linkedDeposits: [],

  remainingRepos: computed('addedDeposits.[]', 'linkedDeposits.[]', function () {
    const addedRepos = this.get('addedDeposits').map(deposit => deposit.get('repo'));
    const linkedRepos = this.get('linkedDeposits').map(deposit => deposit.get('repo'));

    return this.get('allRepos').filter(repo => !addedRepos.includes(repo) && !linkedRepos.includes(repo));
  }),

  init() {
    this._super(...arguments);

    const linkedDeposits = this.get('linkedDeposits');

    for (const deposit of this.get('addedDeposits')) {
      if (!linkedDeposits.includes(deposit)) {
        linkedDeposits.pushObject(deposit);
      }
    }
  },
});
