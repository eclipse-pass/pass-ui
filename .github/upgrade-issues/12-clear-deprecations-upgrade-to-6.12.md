---
title: "Clear deprecation workflow and upgrade to Ember 6.12"
labels: ["upgrade", "ember-7", "sprint-4"]
depends_on: [10]
---

## Summary

With all v1 addons removed/upgraded (issue #10), the 12 silenced deprecations in the workflow should no longer fire. Clear the workflow, upgrade ember-source to 6.12 (the final minor before 7.0), and do a final deprecation sweep.

## Blocked By

- #10 — V1 addon removal (the 12 silenced deprecations all come from v1 addons)
- Can run in parallel with #11 (WarpDrive migration)

## Currently Silenced Deprecations (all from v1 addon code)

```javascript
{ handler: 'silence', matchId: 'template-action' },
{ handler: 'silence', matchId: 'importing-inject-from-ember-service' },
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
```

**Source analysis**:
- `template-action` — from ember-power-select v7, ember-modal-dialog (both removed/upgraded in #10)
- `importing-inject-from-ember-service` — from ember-bootstrap, ember-modal-dialog (both removed in #10)
- `deprecate-import-*-from-ember` (10 entries) — from v1 addon barrel imports of Ember global (all removed in #10)

## Steps

### 1. Verify deprecations no longer fire

1. Set all 12 entries to `handler: 'throw'` (instead of `'silence'`)
2. Run `pnpm test:ember`
3. If any throw, identify the remaining source and fix
4. Once all pass with `'throw'`, remove the entries entirely

### 2. Upgrade to ember-source 6.12

```bash
pnpm add ember-source@~6.12.0
pnpm install
pnpm test:ember
```

6.12 is the final minor before 7.0 and will surface any last deprecation warnings.

### 3. Final deprecation sweep

1. Run tests with `throwOnUnhandled: true` and empty handlers list
2. Fix any new deprecations introduced in 6.9-6.12
3. Ensure zero deprecation warnings

### 4. Verify `using-amd-bundles` deprecation (6.10)

This deprecation applies to apps using classic builds. Since pass-ui is on Vite (`@embroider/vite`), it should not fire. Verify explicitly.

## Acceptance Criteria

- [ ] Deprecation workflow has zero silenced entries
- [ ] `throwOnUnhandled: true` with empty handlers — zero deprecation errors
- [ ] `ember-source` at `~6.12.0`
- [ ] `pnpm test:ember` — all tests pass
- [ ] `pnpm lint` — no errors
- [ ] `pnpm build` — production build succeeds
