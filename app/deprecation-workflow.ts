// @ts-expect-error no types for ember-cli-deprecation-workflow
import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [],
});
