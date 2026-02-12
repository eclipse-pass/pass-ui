// @ts-expect-error no types for ember-cli-deprecation-workflow
import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [
    // From v1 addon templates (ember-power-select, ember-bootstrap, etc.) — not our code
    { handler: 'silence', matchId: 'template-action' },
    // From v1 addons (ember-bootstrap, ember-modal-dialog) still using inject as service
    { handler: 'silence', matchId: 'importing-inject-from-ember-service' },
    // Barrel imports from v1 addons accessing the Ember global — removed in 7.0.0
    { handler: 'silence', matchId: 'deprecate-import-test-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-testing-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-onerror-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-destroy-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-libraries-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--is-destroyed-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--is-destroying-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--register-destructor-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--set-classic-decorator-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--container-proxy-mixin-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import--registry-proxy-mixin-from-ember' },
  ],
});
