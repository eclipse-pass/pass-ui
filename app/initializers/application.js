export function initialize(/* application */) {
  Ember.onerror = (error) => {
    console.log(` >> Ember error caught: ${error}`);
    if (error.message === 'shib302') {
      window.location.reload(true);
    }
  };

  Ember.RSVP.on('error', (error) => {
    console.log(` >> RSVP error caught: ${error}`);
    if (error.message === 'shib302') {
      window.location.reload(true);
    }
  });
}

export default {
  initialize
};
