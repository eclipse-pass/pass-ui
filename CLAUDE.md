# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TypeScript Conversion Rules (Active)

This codebase is being converted from JavaScript to TypeScript. The cardinal rule:

**ZERO RUNTIME CHANGES.** When converting `.js` → `.ts`, only add type annotations. Do not change any runtime behavior. Specifically:
- Do NOT change `get(this, 'prop')` to `this.prop`
- Do NOT change `this.set('prop', value)` to `this.prop = value`
- Do NOT change import sources (e.g. `ember-concurrency-decorators` → `ember-concurrency`)
- Do NOT change `@alias`, `@computed`, `@observes` patterns to modern equivalents
- Do NOT change task decorator patterns (`@task(function*(){})` vs `@task prop = function*(){}`)
- DO add `declare` to `@service` and `@controller` injected properties
- DO add type annotations to method parameters and return types
- DO add `import type` for model/service types
- DO use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` above `any` typed declarations
- DO change `super(...arguments)` to `constructor(...args: any[]) { super(...args); }` with rest params (Ember passes owner as constructor arg — must forward it)
- For `@alias` properties, do NOT add `declare` (alias initializes the property at runtime)

Legacy pattern cleanup (get/set, @computed, @alias, @observes) happens in a separate, later pass — not during the TypeScript conversion.

## Ember.js Development Guidance

When working in this codebase, operate as a senior staff Ember.js engineer. Apply deep knowledge of Ember's reactivity model, Ember Data, the Glimmer rendering engine, and Octane idioms.

### Component Authoring
- All components are Glimmer (`import Component from '@glimmer/component'`). Never introduce classic components.
- Use `@tracked` for all mutable local state. Never introduce `@computed` — use native getters over `@tracked` properties instead.
- Use `@action` for event handlers. Prefer `{{on "event" this.handler}}` and `{{fn}}` in templates — do not use the legacy `{{action}}` helper.
- Access component arguments via `this.args.argName` in JS and `@argName` in templates. Do not use `@alias('args.x')` in new code — reference `this.args` directly.
- Understand Glimmer's one-way data flow: parent owns state, child communicates up via callbacks (`@onSave={{this.handleSave}}`). Avoid mutating args.
- For components that need no JS logic, use template-only components (just an `.hbs` file, no `.js` backing class).

### Reactivity & State
- Ember's autotracking system: getters that read `@tracked` properties auto-invalidate. No need to declare dependencies — just read tracked state in a getter and it recomputes when dependencies change.
- Never use `Ember.set()`, `Ember.get()`, `set(this, ...)`, `get(this, ...)` in new code. Use direct property access (`this.foo`, `this.foo = bar`). Existing code has legacy `get()`/`set()` calls — migrate when touching those lines.
- Never introduce observers (`@observes`). They exist in legacy code (e.g., `app/helpers/search-associated.js`) but should not be replicated. Use derived state via getters or `ember-concurrency` tasks instead.
- `@alias` is a legacy pattern. In new code, use native getters: `get submission() { return this.args.submission; }` or reference `this.args` directly.

### Ember Concurrency
- This codebase uses `ember-concurrency` extensively. Use `@task` for async operations that need cancellation, debouncing, or lifecycle awareness.
- Generator function syntax (`function*` with `yield`) and async task syntax (`async () =>`) are both present. Either is acceptable, but async syntax is preferred for new code:
  ```js
  loadData = task({ drop: true }, async () => {
    const result = await this.store.query('model', filter);
    this.data = result;
  });
  ```
- Use `.perform()` to invoke tasks, `.isRunning` to check status. In templates: `{{perform this.loadData}}`.
- Task modifiers: `drop` (ignore if already running), `restartable` (cancel previous), `enqueue` (queue up). Choose the right one for the UX.

### Ember Data
- Models use native class syntax with `@attr`, `@belongsTo`, `@hasMany` from `@ember-data/model`.
- **Critical**: This app's API does NOT pluralize model names. The inflector is configured in `app/initializers/pass-api-inflector.js`. When creating new models, ensure the inflector config includes them if needed.
- Relationship options: most relationships use `{ async: false, inverse: null }` or `{ async: true, inverse: null }`. Understand the distinction — `async: false` expects data to be sideloaded/already in store; `async: true` returns a PromiseProxy that must be awaited.
- The JSON:API adapter (`app/adapters/application.js`) uses `pathForType` to camelCase model names instead of Ember's default dasherized plurals.
- When querying, this app uses Elide's RSQL filter syntax (e.g., `submission.id==${id}`).

### Routes & Data Loading
- Load data in route `model()` hooks, not in components. Use `RSVP.hash()` for parallel loading of multiple resources.
- Error handling: routes that need auth extend `CheckSessionRoute` which handles 401/403 by invalidating the session.
- Use `setupController()` to pass additional data beyond `model` to controllers. The submission workflow does this extensively.
- Understand Ember's loading/error substates — name templates `loading.hbs` and `error.hbs` alongside route templates.

### Templates (Handlebars)
- Always use angle bracket invocation: `<MyComponent @arg={{value}} />`, never curly `{{my-component}}`.
- Use `{{on "click" this.handler}}` for DOM events, `{{fn this.method arg}}` for partial application.
- This codebase uses `{{did-insert}}` and `{{did-update}}` modifiers for DOM-dependent setup (e.g., initializing SurveyJS forms).
- Use `data-test-*` attributes for all test selectors. Never select by CSS class or element structure in tests.
- Bootstrap 5 classes and `ember-bootstrap` components (`<BsButton>`, `<BsModal>`, etc.) for UI.

### Testing
- Write tests for all new functionality. Use the right test level:
  - **Unit tests** (`setupTest`): services, models, utilities — no rendering.
  - **Integration tests** (`setupRenderingTest`): components — test rendering and interaction.
  - **Acceptance tests** (`setupApplicationTest` + `setupMirage`): full user flows through the app.
- Use `@ember/test-helpers`: `render()`, `click()`, `fillIn()`, `triggerEvent()`, `find()`, `findAll()`.
- Use `authenticateSession()` from ember-simple-auth's test support when a test requires an authenticated session.
- Mock backend responses with Mirage — factories in `mirage/factories/`, route handlers in `mirage/config.js`.
- Prefer `assert.dom()` (from `qunit-dom`) for DOM assertions when available. Also use `assert.strictEqual`, `assert.ok`, `assert.notOk`.
- Async test patterns: always `await` render, click, and other interactions. Ember's test helpers handle `settled` automatically.

### Service Design
- Services are singletons — inject with `@service`. Use named injection when the service name differs from the property: `@service('current-user') currentUser;`.
- Keep services focused: `submission-handler` owns submission lifecycle, `workflow` owns wizard step state, `metadata-schema` owns form schema logic. Follow this pattern for new services.
- The `workflow` service holds ephemeral client-side state (current step, files, grants). It is not persisted and resets per submission flow.

### Performance & Patterns to Avoid
- Never use `observers`, `on('init')`, `didInsertElement`, `didRender` lifecycle hooks from classic components. Use constructor + `@tracked` + `{{did-insert}}` modifier instead.
- Avoid `reopenClass`, mixins, and `Ember.Object.extend()`. Always use native class syntax.
- Don't use `this.get('deeply.nested.path')` — use optional chaining: `this.deeply?.nested?.path`.
- Avoid creating unnecessary abstractions over Ember Data. Use `store.query()`, `store.findRecord()`, `store.createRecord()` directly.

## Project Overview

PASS UI is an Ember.js 5.8 (Octane) application for the Eclipse PASS (Public Access Submission System) project. It connects to a PASS Core backend via an Elide-based JSON:API. The app's primary function is guiding researchers through a multi-step submission workflow to deposit manuscripts into compliance repositories.

## Common Commands

### Development
```bash
pnpm start              # Start dev server
pnpm build              # Production build
pnpm build:dev          # Development build
```

### Testing
```bash
pnpm test:ember         # Run all Ember tests (QUnit)
pnpm test               # Run linting + tests concurrently
```

To run a single test or module, use `--filter`:
```bash
pnpm test:ember --filter="module name or test name"
```

### Linting
```bash
pnpm lint               # Run all linters
pnpm lint:fix           # Run all linters with auto-fix
pnpm lint:js            # ESLint only
pnpm lint:hbs           # Handlebars template lint only
pnpm lint:css           # Stylelint only
```

### Docker
```bash
pnpm build:docker       # Build Docker image with version tag
./build.sh <env_file>   # Full build with environment file
```

## Architecture

### API Integration
- JSON:API adapter communicates with Elide backend at namespace `/data/` (configurable via `PASS_API_NAMESPACE`)
- **Model names are NOT pluralized** in API paths — configured in `app/initializers/pass-api-inflector.js`
- XSRF-TOKEN is read from cookies and sent as a header in `app/adapters/application.js`
- 401/403 responses automatically invalidate the session

### Authentication
- Uses ember-simple-auth with a custom `http-only` authenticator (`app/authenticators/http-only.js`)
- Session is validated by calling `/user/whoami` — no tokens stored client-side
- Routes requiring auth extend `CheckSessionRoute` (`app/routes/check-session-route.js`)

### Submission Workflow
The core feature is a multi-step submission wizard at `/submissions/new/`:

1. **Basics** (`/basics`) — DOI lookup via Crossref, publication info
2. **Grants** (`/grants`) — Select associated grants
3. **Policies** (`/policies`) — View compliance policies derived from grants/funders
4. **Repositories** (`/repositories`) — Select deposit targets (types: FULL, ONE_WAY, WEB_LINK)
5. **Metadata** (`/metadata`) — Dynamic SurveyJS form built from repository schemas
6. **Files** (`/files`) — Manuscript upload via ember-file-upload
7. **Review** (`/review`) — Final review before submission

Workflow state is managed client-side by the `workflow` service (`app/services/workflow.js`) and is not persisted.

### Key Services
- **submission-handler** — Submission lifecycle (submit, approve, request changes, cancel, delete); uses ember-concurrency tasks
- **metadata-schema** — Transforms repository JSON schemas into SurveyJS form definitions; merges field requirements across repositories
- **doi** — DOI resolution via Crossref API; creates Publication records from DOI data
- **policies** — Fetches applicable policies and repositories using a selection DSL (required, one-of, optional)
- **error-handler** — Centralized error handling with SweetAlert2 dialogs; handles session timeouts and auth errors
- **app-static-config** — Loads branding/configuration from `/app/config.json`

### Models (Ember Data)
Central model is `submission`, which has relationships to: `publication`, `user` (submitter/preparers), `repository`, `policy`, `grant`, `deposit`, `file`, and `submission-event`. Metadata is stored as a JSON string on the submission model.

### Testing
- **Framework:** QUnit with Ember test helpers
- **Mocking:** Mirage.js (`mirage/` directory) with factories and fixtures
- **Test types:** Unit (`tests/unit/`), integration (`tests/integration/`), acceptance (`tests/acceptance/`)
- **Selectors:** Uses `data-test-*` attributes for test selectors in templates
- **Auth in tests:** Use `authenticateSession()` helper from ember-simple-auth

### Build System
- **Package manager:** pnpm
- **Bundler:** Embroider with Webpack
- **Node requirement:** >= 20
- Environment variables for API endpoints are configured in `config/environment.js` (e.g., `PASS_UI_ROOT_URL`, `SCHEMA_SERVICE_PATH`, `DOI_SERVICE_PATH`, `POLICY_SERVICE_PATH`)

### Styling
- Bootstrap 5 imported in ember-cli-build.js (ember-bootstrap configured for BS5)
- FontAwesome 6.7.2 for icons
- Custom styles in `app/styles/`
