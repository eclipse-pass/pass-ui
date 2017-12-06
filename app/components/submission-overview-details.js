import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    doiService: service('doi'),

    init() {
        this._super(...arguments);
        var submission = this.get('submission');
        var self = this;
        if (submission) {
            this.get('doiService').resolve(submission).then(function (doiInfo) {
                self.set('doiInfo', doiInfo);
            });
        }
    }
});
