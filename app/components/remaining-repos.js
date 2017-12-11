import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    allRepos: ["PMC", "NSF-PAR", "DOE-PAGES", "JHU-IR"],
    pendingDeposits: [],
    linkedDeposits: [],

    remainingRepos: computed('pendingDeposits.[]', 'linkedDeposits.[]', function() {
        let pendingRepos = this.get('pendingDeposits').map(deposit => deposit.get('repo'));
        let linkedRepos = this.get('linkedDeposits').map(deposit => deposit.get('repo'));

        console.log("Compited remaining repos as " + this.get('allRepos').filter(repo => !pendingRepos.includes(repo) && !linkedRepos.includes(repo)));

        return this.get('allRepos').filter(repo => !pendingRepos.includes(repo) && !linkedRepos.includes(repo));
    })
});
