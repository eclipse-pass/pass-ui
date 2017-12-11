import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    allRepos: ["PMC", "NSF-PAR", "DOE-PAGES", "JHU-IR"],
    addedDeposits: [],
    linkedDeposits: [],

    remainingRepos: computed('addedDeposits.[]', 'linkedDeposits.[]', function() {
        let addedRepos = this.get('addedDeposits').map(deposit => deposit.get('repo'));
        let linkedRepos = this.get('linkedDeposits').map(deposit => deposit.get('repo'));

        return this.get('allRepos').filter(repo => !addedRepos.includes(repo) && !linkedRepos.includes(repo));
    }),

    init() {
        this._super(...arguments);

        var submission = this.get('submission');
        var linkedDeposits = this.get('linkedDeposits');

        for (var deposit of this.get('addedDeposits')) {
            if (!linkedDeposits.includes(deposit)) {
                linkedDeposits.pushObject(deposit);
            }
        }
    }
});
