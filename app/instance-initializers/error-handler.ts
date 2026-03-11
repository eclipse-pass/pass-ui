// Set global error handlers for the application
import { isTesting } from '@ember/debug';
import { setOnerror } from '@ember/-internals/error-handling';
import { on } from 'rsvp';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initialize(app: any) {
  const errorHandler = app.lookup('service:error-handler');

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
