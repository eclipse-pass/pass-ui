import Controller from '@ember/controller';
import { Promise } from 'rsvp';

export default Controller.extend({

    /** Holds all newly-added grants */
    addedGrants: [],

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

            /* Next, remove added grants */
            var addedGrants = this.get('addedGrants');
            var linkedGrants = submission.get('grants');
            while (addedGrants.length) {
                var grant = addedGrants.pop();
                linkedGrants.removeObject(grant);
            }
        },

        /** Links a grant to the submission
         * 
         * @param grant {DS.Model} Grant to link to the submission.
         */
        addGrant(grant) {
            var submission = this.get('model');
            submission.get('grants').pushObject(grant);
            this.get('addedGrants').push(grant);
        },

        /** Saves the submission and updates all newly-added grants to link back to this submission 
         * 
         * @returns {Promise} The Save promise for saving the submission and dependencies 
         */
        saveAll() {
            var grants = this.get('addedGrants');
            this.set('addedGrants', []);
            var submission = this.get('model');


            //TODO: Might want to think of displaying some sort of warning any step fails?
            return Promise.all(grants.map(grant => {
                grant.get('submissions').pushObject(submission);
                return grant.save();
            })).then(() => submission.save());
        }
    }
});
