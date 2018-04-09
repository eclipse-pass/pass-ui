import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    allRepos: ["PMC", "NSF-PAR", "DOE-PAGES", "JHU-IR", "JHU-AR"],
    addedDeposits: [],
    linkedDeposits: [],

    remainingRepos: computed('addedDeposits.[]', 'linkedDeposits.[]', function() {
        let addedRepos = this.get('addedDeposits').map(deposit => deposit.get('repository'));
        let linkedRepos = this.get('linkedDeposits').map(deposit => deposit.get('repository'));

        return this.get('allRepos').filter(repo => !addedRepos.includes(repo) && !linkedRepos.includes(repo));
    }),

    init() {
        this._super(...arguments);

        var linkedDeposits = this.get('linkedDeposits');

        for (var deposit of this.get('addedDeposits')) {
            if (!linkedDeposits.includes(deposit)) {
                linkedDeposits.pushObject(deposit);
            }
        }
    }
});
