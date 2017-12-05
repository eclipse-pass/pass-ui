import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    store: service('store'),
    workflow: null,
    step: null,
    steps: [],

    didReceiveAttrs() {
        var workflow = this.get('workflow');
        if (!workflow) {
           this.set('workflow', this.get('store').createRecord('workflow'));
        } else {
            this.set('steps', workflow.get('steps').split(','));
            this.set('step', workflow.get('step'));
        }
    },

    addStep(step) {
        this.get('steps').push(step);

        if (!this.get('step')) {
            this.set('step', step);
        }
    },

    actions: {
        advance() {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (steps[i+1]) {
                this.set('step', steps[i+1]);
            }
        },

        save() {
            var workflow = this.get('workflow');
            workflow.set('name', this.get('name'));
            workflow.set('steps', this.get('steps').join(','));
            workflow.set('step', this.get('step'));
            
            return workflow.save();
        }
    }
});
