// Set global error handlers for the application
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Ember from 'ember';

import { on } from 'rsvp';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initialize(app: any) {
  const errorHandler = app.lookup('service:error-handler');

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
  initialize,
};
