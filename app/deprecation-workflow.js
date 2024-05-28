import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [{ handler: 'throw', matchId: 'ember-data:deprecate-promise-many-array-behaviors' }],
});
