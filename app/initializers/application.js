export function initialize(/* application */) {
  Ember.onerror = (error) => {
    console.log(` >> Ember error caught: ${error}`);
    window.location.reload(true);
  };

  Ember.RSVP.on('error', (error) => {
    console.log(` >> RSVP error caught: ${error}`);
  });
}

export default {
  initialize
};
