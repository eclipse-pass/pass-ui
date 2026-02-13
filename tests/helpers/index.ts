import {
  setupApplicationTest as upstreamSetupApplicationTest,
  setupRenderingTest as upstreamSetupRenderingTest,
  setupTest as upstreamSetupTest,
} from 'ember-qunit';
// This file exists to provide wrappers around ember-qunit's / ember-mocha's
// test setup functions. This way, you can easily extend the setup that is
// needed per test type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupApplicationTest(hooks: any, options?: any) {
  upstreamSetupApplicationTest(hooks, options);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupRenderingTest(hooks: any, options?: any) {
  upstreamSetupRenderingTest(hooks, options);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupTest(hooks: any, options?: any) {
  upstreamSetupTest(hooks, options);
}

export { setupApplicationTest, setupRenderingTest, setupTest };
