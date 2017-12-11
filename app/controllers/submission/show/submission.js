import Controller from '@ember/controller';

// Set these values to specify the server to which the submission POST is made.
var URL  = 'http://128.84.9.164'
var PORT = 7000

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
                    console.log("command passed")
                } else {
                    // Command failed
                    console.log("command failed")
                }
            });
                  
            this.set('isSent', true);
        }
    }
});
