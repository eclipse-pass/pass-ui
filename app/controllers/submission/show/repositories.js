import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({

    addedDeposits: [],

    store: service('store'),

    localRepoName: "JHU-IR",
    depositLocally: true,
    /**
     * If local repository is already a part of the submission before this step,
     * make sure the user can't remove it (computed on init).
     */
    forceLocalDeposit: computed(function() {
        let local = this.get('localRepoName');
        return this.get('model').get('deposits').filter(d => d.get('repo') === local).length > 0;
    }),

    actions: {

        /** Rollback the submission, clears the list of added grants 
         * 
         * There is no facility for rolling back relationships, so this has to be
         * accounted manually.
         * 
        */
        rollback() {
            var submission = this.get('model');

            /* First, reset submission attributes */
            submission.rollbackAttributes();

            /* Next, remove added deposits */
            var addedDeposits = this.get('addedDeposits');
            var linkedDeposits = submission.get('deposits');
            while (addedDeposits.length) {
                var deposit = addedDeposits.pop();
                linkedDeposits.removeObject(deposit);
                deposit.rollbackAttributes();
            }
        },

        /** Creates and inks a deposit to the submission for the given repo
         * 
         * @param {string} repoName Name of a repository to add a deposit for.
         */
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

        selectLocalDeposit() {
            this.set('depositLocally', !this.get('depositLocally'));
        },

        /** Determines if the given repo is among the deposits.
         * 
         * @param {string} repo Repository name.
         */
        isPresent(repo) {
            let savedDeposits = this.get('model').get('deposits');
            let addedDeposits = this.get('addedDeposits');

            // Ugh, can't think of a better way to do this with the PromiseArrays
            // we get back from relationships.  Concat doesn't work with them. 
            return savedDeposits.map(deposit => deposit.get('repo')).includes(repo)
                || addedDeposits.map(deposit => deposit.get('repo')).includes(repo);
        },

        /** Saves the submission and updates all newly-added deposits to link back to this submission 
         * 
         * @returns {Promise} Save promise for the submission and deposits
         */
        saveAll() {
            if (this.get('localDepositChecked')) {
                this.actions.addRepo(this.get('localRepoName'));
            }
            var deposits = this.get('addedDeposits');
            this.set('addedDeposits', []);

            var submission = this.get('model');

            //TODO: Might want to think of displaying some sort of warning any step fails?
            return Promise.all(deposits.map(deposit => deposit.save()))
                .then(() => submission.save());
        }, 
    }
});
