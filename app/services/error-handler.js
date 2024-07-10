import Service from '@ember/service';
import ENV from 'pass-ui/config/environment';

// Consolidates error handling.
// The method handleError will figure out which handler to invoke.

export default class ErrorHandlerService extends Service {
  handleError(error) {
    if (error.name == 'TransitionAborted') {
      // Ignore what seems to be spurious transition errors.
      // See https://github.com/emberjs/ember.js/issues/12505
      return;
    }

    console.log(`Handling error: ${JSON.stringify(error.message)}`);

    // Error stack is non-standard. Show if available.

    if (error.stack) {
      console.log(error.stack);
    } else {
      console.log(error);
    }

    if (error.message === 'shib302') {
      // Sent from the session checker to indicate the session has timed out.
      this.handleSessionTimeout(error);
    } else if (error.message === 'didNotLoadData') {
      // Used to indicate when expected data is missing, will do reload
      this.handleDidNotLoadDataError(error);
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
  }

  handleSessionTimeout(error) {
    swal({
      target: ENV.APP.rootElement,
      type: 'error',
      title: 'Your session timed out',
      text: 'When you click OK the page will reload.',
    }).then((result) => {
      if (result.value) {
        window.location.reload(true);
      }
    });
  }

  handleLoginFailure(error) {
    window.location.replace('/401.html');
  }

  handleAuthorizationProblem(error) {
    window.location.replace('/403.html');
  }

  handleNotFound(error) {
    // Assume rootURL ends in '/'
    window.location.replace(`${ENV.rootURL}404`);
  }

  handleDidNotLoadDataError(error) {
    swal({
      target: ENV.APP.rootElement,
      type: 'error',
      title: 'Page could not load',
      text: `Some information required by this page did not load correctly. When you click OK the page will reload. If the issue persists, please contact us and include a copy of this message. ${JSON.stringify(
        error.message,
      )}`,
    }).then((result) => {
      if (result.value) {
        window.location.reload(true);
      }
    });
  }

  handleUnknownError(error) {
    swal({
      target: ENV.APP.rootElement,
      type: 'error',
      title: 'Something went wrong.',
      text: `When you click OK the page will reload. If the issue persists, please contact us and include a copy of this message. ${JSON.stringify(
        error.message,
      )}`,
    }).then((result) => {
      if (result.value) {
        window.location.reload(true);
      }
    });
  }
}
