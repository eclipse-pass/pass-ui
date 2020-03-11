// Set global error handlers for the application

import { on } from 'rsvp';

export function initialize(app) {
  let errorHandler = app.lookup('service:error-handler');


  Ember.onerror = (error) => {
    if (Ember.testing) {
      throw error;
    }
    errorHandler.handleError(error);
  };

  on('error', (error) => {
    errorHandler.handleError(error);
  });
}

export default {
  initialize
};
