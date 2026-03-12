import { setupMirage as _setupMirage } from 'ember-mirage/test-support';
import mirageConfig from 'pass-ui/mirage/config';

export function setupMirage(hooks: NestedHooks) {
  // Set a fake XSRF-TOKEN cookie before mirage routes are hit.
  // The application adapter reads this cookie to build request headers.
  hooks.beforeEach(function () {
    document.cookie = 'XSRF-TOKEN=test-token; path=/';
  });
  hooks.afterEach(function () {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  return _setupMirage(hooks, { createServer: mirageConfig });
}
