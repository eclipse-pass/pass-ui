// import config from 'pass-ember/config/environment';

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

  // const moo = config.rootURL;
  // debugger
  if (error.status == 401 || error.payload == 401) {
    return;
  }
  if (error.status == 403 || error.payload == 403) {
    return;
  }
  if (error.payload == 'Unauthorized') {
    return;
  }
  // Login, logout, navigate to landing page, click to login
  // Error message"The ajax operation was aborted"
  // swal({
  //   type: 'error',
  //   title: 'Error',
  //   text: 'Something went wrong'
  // });
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
