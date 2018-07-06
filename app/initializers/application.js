import ENV from 'pass-ember/config/environment';

function interrogateError(error) {
  console.log(`THE ERROR ::: ${JSON.stringify(error)}`);
  if (error.name == 'TransitionAborted') {
    return; // Ignore
  }
  // debugger
  if (error.message === 'shib302') {
    window.location.reload(true);
    return;
  }

  if (error.status == 401 || error.payload == 401) {
    window.location.replace('/401.html');
    return;
  }
  if (error.status == 403 || error.payload == 403) {
    // window.location.replace('/403.html');
    return;
  }
  if (error.payload == 'Unauthorized') {
    // window.location.replace('/403.html');
    return;
  }
  if (error.status == 404) {
    // Get 404 page in app, assume rootURL ends in '/'
    window.location.replace(`${ENV.rootURL}404`);
  }
  // Login, logout, navigate to landing page, click to login
  // Error message"The ajax operation was aborted"
  swal({
    type: 'error',
    title: 'Something went wrong',
    text: `${error.message}`
  });
}

export function initialize(/* application */) {
  console.log('Initialization MOO');
  Ember.onerror = (error) => {
    interrogateError(error);
  };

  Ember.RSVP.on('error', (error) => {
    interrogateError(error);
  });
}

export default {
  initialize
};
