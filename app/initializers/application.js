import config from 'pass-ember/config/environment';

function interrogateError(error) {
  console.log(`THE ERROR ::: ${JSON.stringify(error)}`);
  // debugger
  if (error.message === 'shib302') {
    window.location.reload(true);
    return;
  }

  const moo = config.rootURL;

  if (error.status == 401 || error.payload == 401) {
    console.log(' >> 401 error');
    // window.location.replace('https://google.com');
  }
  if (error.status == 403 || error.payload == 403) {
    console.log(' >> 403 error');
    // window.location.replace('https://google.com');
  }
}

export function initialize(/* application */) {
  console.log('Initialization MOO');
  Ember.onerror = (error) => {
    console.log(` >> Ember error caught: ${error}`);
    interrogateError(error);
  };

  Ember.RSVP.on('error', (error) => {
    console.log(` >> RSVP error caught: ${error}`);
    interrogateError(error);
  });
}

export default {
  initialize
};
