import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

    step: null,

    isShowing: computed("group.step", function () {
        var group = this.get('group');
        if (group) {
            return this.get('step') === group.get('step');
        } 
        return false;
    }),

    init() {
        this._super(...arguments);

        var step = this.get('step');
        var group = this.get('group');
        
        if (step && group) {
            group.addStep(step);
        }
    },
});
