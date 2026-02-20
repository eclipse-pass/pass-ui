/* eslint-disable @typescript-eslint/no-explicit-any */
import ENV from 'pass-ui/config/environment';
import makeServer from 'pass-ui/mirage/config';

/**
 * Start Mirage when ember-mirage is enabled.
 *
 * The ember-cli-mirage v1 addon's app/initializers/ tree is not merged
 * into the Embroider/Vite build, so we create our own initializer.
 */
export function initialize() {
  const mirageConfig = (ENV as any)['ember-mirage'];
  if (mirageConfig?.enabled) {
    // Pass environment: 'test' so MirageJS does NOT auto-load fixtures
    // (our config calls server.loadFixtures() explicitly after creating extra records).
    makeServer({});
  }
}

export default {
  name: 'start-mirage',
  initialize,
};
