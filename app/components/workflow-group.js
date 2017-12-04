import Component from '@ember/component';

export default Component.extend({
    step: null,

    steps: [],

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
        }
    }
});
