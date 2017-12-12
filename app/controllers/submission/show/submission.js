import Controller from '@ember/controller';

// Set these values to specify the server to which the submission POST is made.
var URL  = '192.168.99.100'
var PORT = 8080

export default Controller.extend({
    actions: {

        // POST to the server to initiate the FTP operation
        doSend() {
            var fullURL = encodeURI(URL + ":" + PORT)

            fetch(fullURL, {
                method: 'POST'
            }).then(function(response) {
                if (response.ok) {
                    // Command succeeded
                } else {
                    // Command failed
                }
            });

            this.set('isSent', true);
        }
    }
});
