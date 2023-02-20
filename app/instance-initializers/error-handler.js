// Set global error handlers for the application

import { on } from 'rsvp';

export function initialize(app) {
  let errorHandler = app.lookup('service:error-handler');

  // Ember global is deprecated so if we need this we need to find another way to handle the call
  // Ember.onerror = (error) => {
  //   if (Ember.testing) {
  //     throw error;
  //   }
  //   errorHandler.handleError(error);
  // };

  on('error', (error) => {
    errorHandler.handleError(error);
  });
}

export default {
  initialize,
};
