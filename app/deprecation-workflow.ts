// @ts-expect-error no types for ember-cli-deprecation-workflow
import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [
    // @ember-data/* 5.3 still uses `inject` instead of `service` — remove after Ember Data upgrade
    { handler: 'silence', matchId: 'importing-inject-from-ember-service' },
    // Barrel imports from ember internals and addons — removed in Ember 7.0
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
