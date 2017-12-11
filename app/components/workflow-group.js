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
        advance() {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (steps[i+1]) {
                this.set('step', steps[i+1]);
            }
        },

        back() {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (i > 0) {
                this.set('step', steps[i-1]);
            }
        },

        save() {
            var workflow = this.get('workflow');
            workflow.set('name', this.get('name'));
            workflow.set('steps', this.get('steps').join(','));
            workflow.set('step', this.get('step'));
            
            return workflow.save();
        }, 

        attachWorkflow(target, rel) {

            if (typeof rel === 'string') {
                target.get(rel).pushObject(this.get('workflow'));
            } else {
                target.get('workflows').pushObject(this.get('workflow'));
            }
        },

        nextActionFor(step) {
            var steps = this.get('steps');
            if (steps.indexOf(step) === (steps.length - 1)) {
                this.get('last')();
            } else {
                this.get('actions').advance.call(this);
            }
        },

        backActionFor(step) {
            if (this.get('steps').indexOf(step) === 0) {
                this.get('first')();
            } else {
                this.get('actions').back.call(this);
            }
        },
    }
});
