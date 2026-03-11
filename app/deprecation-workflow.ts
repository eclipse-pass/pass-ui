// @ts-expect-error no types for ember-cli-deprecation-workflow
import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [
    // Barrel imports triggered by @ember/test-helpers 4.0.5 (validate-error-handler.js,
    // setup-onerror.js). Remove once @ember/test-helpers ships scoped imports.
    { handler: 'silence', matchId: 'deprecate-import-onerror-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-testing-from-ember' },
  ],
});
