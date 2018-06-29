import config from 'pass-ember/config/environment';

function interrogateError(error) {
  console.log(`THE ERROR ::: ${JSON.stringify(error)}`);
  // debugger
  if (error.message === 'shib302') {
    window.location.reload(true);
    return;
  }

  // const moo = config.rootURL;

  if (error.status == 401 || error.payload == 401) { // eslint-disable-line
  }
  if (error.status == 403 || error.payload == 403) { // eslint-disable-line
  }
  // Login, logout, navigate to landing page, click to login
  // Error message"The ajax operation was aborted"
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
