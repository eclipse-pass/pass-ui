import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

// Consolidates error handling.
// The method handleError will figure out which handler to invoke.

export default Service.extend({
  handleError(error) {
    console.log(`Handling error: ${JSON.stringify(error)}`);

    if (error.name == 'TransitionAborted') {
      // Ignore
    } else if (error.message === 'shib302') {
      // Sent from the Fedora adapter to indicate the session has timed out.
      this.handleSessionTimeout(error);
    } else if (error.status == 401 || error.payload == 401 || error.payload == 'Unauthorized') {
      // Login failure.
      this.handleLoginFailure(error);
    } else if (error.status == 403 || error.payload == 403) {
      // Some authorization issue
      this.handleAuthorizationProblem(error);
    } else if (error.status == 404) {
      // Failure to find a resource
      this.handleNotFound(error);
    } else {
      // Something else went wrong.

      // An error can be triggered by:
      //   Login, logout, navigate to landing page, click to login
      //   Error message"The ajax operation was aborted"

      this.handleUnknownError(error);
    }
  },

  handleSessionTimeout(error) {
    window.location.reload(true);
  },

  handleLoginFailure(error) {
    window.location.replace('/401.html');
  },

  handleAuthorizationProblem(error) {
    window.location.replace('/403.html');
  },

  handleNotFound(error) {
    // Assume rootURL ends in '/'
    window.location.replace(`${ENV.rootURL}404`);
  },

  handleUnknownError(error) {
    swal({
      type: 'error',
      title: 'Something went wrong',
      text: `${error.message}`
    });
  }
});
