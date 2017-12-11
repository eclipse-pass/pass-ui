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
            console.log("No workflow");
           this.set('workflow', this.get('store').createRecord('workflow'));
        } else {
            console.log("Opening existing workflow " + workflow.get('name') );
            this.set('steps', workflow.get('steps').split(','));
            this.set('step', workflow.get('step'));
        }
    },

    addStep(step) {
        let filter = this.get('stepFilter');
        
        if (filter) {
            if (!filter(step)) {
                console.log('NOT adding step ' + name);
                return;
            }
        }
        
        console.log("Adding step " + step);

        this.get('steps').push(step);

        if (!this.get('step')) {
            this.set('step', step);
        }
    },

    actions: {
        advance() {
            var steps = this.get('steps');
            var step = this.get('step');
            console.log("Steps are: " + steps);
            var i = steps.findIndex((e) => e === step);
            console.log("Current step " + step + " is at: " + i);

            if (steps[i+1]) {
                this.set('step', steps[i+1]);
            }
            console.log("After advance, at step " + this.get('step') + " :" + (i+1));
        },

        back(self) {
            var steps = this.get('steps');
            var step = this.get('step');
            var i = steps.findIndex((e) => e === step);

            if (i > 0) {
                this.set('step', steps[i-1]);
            }
            console.log("After back, at step " + this.get('step') + " :" + (i-1));
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
                console.log("This is last, so going down...");
                this.get('last')();
            } else {
                console.log("not last, so going forward");
                this.get('actions').advance.call(this);
            }
        },

        backActionFor(step) {
            if (this.get('steps').indexOf(step) === 0) {
                console.log("This is first, so going up...")
                this.get('first')();
            } else {
                console.log("not first, so going back");
                this.get('actions').back.call(this);
            }
        },
    }
});
