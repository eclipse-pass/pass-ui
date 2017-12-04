import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    didRegister: false,

    step: null,

    isShowing: computed("group.step", function () {
        var group = this.get('group');
        return this.get('step') === group != null ? group : null;
    }),

    didReceiveAttrs() {
        this._super(...arguments);
        if (this.get('didRegister')) {
            return;
        }

        var step = this.get('step');
        var group = this.get('group');

        if (step && group) {
            this.set('didRegister', true);
            group.addStep(step);
        }
    },
});
