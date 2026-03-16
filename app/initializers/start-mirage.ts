import ENV from 'pass-ui/config/environment';
import makeServer from 'pass-ui/mirage/config';

/**
 * Start Mirage when ember-mirage is enabled.
 *
 * The ember-cli-mirage v1 addon's app/initializers/ tree is not merged
 * into the Embroider/Vite build, so we create our own initializer.
 */
export function initialize() {
  const mirageConfig = (ENV as Record<string, unknown>)['ember-mirage'] as { enabled?: boolean } | undefined;
  if (mirageConfig?.enabled) {
    // Pass environment: 'test' so MirageJS does NOT auto-load fixtures
    // (our config calls server.loadFixtures() explicitly after creating extra records).
    makeServer({});

    // Set the XSRF-TOKEN cookie that the real backend normally provides.
    // The adapter reads this from document.cookie to send as a header.
    if (!document.cookie.includes('XSRF-TOKEN')) {
      document.cookie = 'XSRF-TOKEN=mirage-dev-token; path=/';
    }
  }
}

export default {
  name: 'start-mirage',
  initialize,
};
