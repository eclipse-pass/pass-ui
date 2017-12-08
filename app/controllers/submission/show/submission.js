import Controller from '@ember/controller';

export default Controller.extend({
    actions: {

        /** Send the submission! */
        doSend() {
            this.set('isSent', true);
        }
    }
});
