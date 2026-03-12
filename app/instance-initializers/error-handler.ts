// Set global error handlers for the application
import { isTesting } from '@ember/debug';
import { setOnerror } from '@ember/-internals/error-handling';
import { on } from 'rsvp';
import type ApplicationInstance from '@ember/application/instance';

export function initialize(app: ApplicationInstance) {
  const errorHandler = app.lookup('service:error-handler') as { handleError(error: Error | unknown): void };

  setOnerror((error: Error) => {
    if (isTesting()) {
      throw error;
    }
    errorHandler.handleError(error);
  });

  on('error', (error) => {
    errorHandler.handleError(error);
  });
}

export default {
  initialize,
};
