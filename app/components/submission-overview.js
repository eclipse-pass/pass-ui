import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
    doiService: service('doi'),
    doiInfo: null,
    doiError: null,

    actions: {
        resolveDoi() {
            var submission = this.get('submission');
            return this.get('doiService').resolve(submission).then((doi) => {
                this.set('doiInfo', doi);
            }).catch((err) => { 
                this.set('doiError', err);
            });
        }
    }
});
