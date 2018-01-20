import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    workflow: null,
    step: null,
    steps: [],

    init() {
        this._super(...arguments)
        this.set('steps', []);
        var workflow = this.get('workflow');
        if (!workflow) {
           this.set('workflow', this.get('store').createRecord('workflow'));
        } else {
            this.set('steps', workflow.get('steps').split(','));
            this.set('step', workflow.get('step'));
        }
    },

    addStep(step) {
        let filter = this.get('stepFilter');
        
        if (filter) {
            if (!filter(step)) {
                return;
            }
        }

        this.get('steps').push(step);

        if (!this.get('step')) {
            this.set('step', step);
        }
    },

    actions: {

        /** Advance one step in the workflow */
        advance() {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (steps[i+1]) {
                this.set('step', steps[i+1]);
            }
        },

        /** Go back one step in the workflow */
        back() {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (i > 0) {
                this.set('step', steps[i-1]);
            }
        },

        /** Save the workflow state, and link it to the given target resource, if necessary.
         * 
         * Does NOT save the target resource.  So if the workflow is new
         * (and therefore newly linked to the target resource),
         * the target resource needs to be saved elsewhere before the
         * link to the workflow is persistent.
         * 
         * @param {DS.Model} target DS.Model object to link to the workflow
         * @returns {Promise} ember-data save promise for the workflow saving action.
         */
        saveWorkflow(target) { // AUDIT
            var workflow = this.get('workflow');
            let workflows = target.get('workflows');

            if (!workflows.length) {
                workflows.pushObject(workflow);
            }

            workflow.set('name', this.get('name'));
            workflow.set('steps', this.get('steps').join(','));
            workflow.set('step', this.get('step'));
            
            return workflow.save(); // AUDIT
        }, 

        /** Invoke the 'next/advance' action associated with this workflow step.
         * 
         * @param {string} step The current step name 
         */
        nextActionFor(step) {
            var steps = this.get('steps');
            if (steps.indexOf(step) === (steps.length - 1)) {
                this.get('last')();
            } else {
                this.get('actions').advance.call(this);
            }
        },

        /** Invoke the 'back' action associated with this workflow step 
         * 
         * @param {string} step The current step name 
         */
        backActionFor(step) {
            if (this.get('steps').indexOf(step) === 0) {
                this.get('first')();
            } else {
                this.get('actions').back.call(this);
            }
        },
    }
});
