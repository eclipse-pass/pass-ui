// Set global error handlers for the application

export function initialize(app) {
  // let errorHandler = app.lookup('service:error-handler');


  // Ember.onerror = (error) => {
  //   if (Ember.testing) {
  //     throw error;
  //   }
  //   errorHandler.handleError(error);
  // };

  // Ember.RSVP.on('error', (error) => {
  //   errorHandler.handleError(error);
  // });
}

export default {
  initialize
};
