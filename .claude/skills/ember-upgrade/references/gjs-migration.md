# GJS/GTS Migration Reference

## Import Reference for Strict Mode

When converting from `.hbs` + `.js` to `.gjs`, every template global must become an explicit import. This is the most common source of errors during conversion.

### Ember Built-in Imports

```js
// Modifiers
import { on } from '@ember/modifier';

// Helpers
import { fn, hash, array, get, concat } from '@ember/helper';

// Control flow (these are keywords, NOT imported)
// {{#if}}, {{#each}}, {{#let}}, {{yield}}, {{outlet}}, {{#unless}} — no import needed

// Component yielding
// {{yield}} — keyword, no import needed
// {{has-block}} and {{has-block-params}} — keywords, no import needed
```

### Common Addon Imports

```js
// ember-truth-helpers
import { not, and, or, eq, notEq, gt, gte, lt, lte } from 'ember-truth-helpers';

// ember-composable-helpers (only those configured in ember-cli-build.js)
import { queue, compute, invoke, includes } from 'ember-composable-helpers';

// ember-concurrency
import { perform } from 'ember-concurrency';

// ember-bootstrap (angle bracket components)
import BsButton from 'ember-bootstrap/components/bs-button';
import BsModal from 'ember-bootstrap/components/bs-modal';
// etc.

// ember-power-select
import PowerSelect from 'ember-power-select/components/power-select';

// ember-file-upload
import FileUpload from 'ember-file-upload/components/file-upload';

// ember-simple-auth — not typically used in templates

// SurveyJS — typically initialized in JS, not imported into templates
```

### The `{{on}}` and `{{fn}}` Pattern

In classic `.hbs`:
```hbs
<button {{on "click" (fn this.handleClick @item)}}>Click</button>
```

In `.gjs` — identical template syntax but must import:
```gjs
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

export default class MyComponent extends Component {
  <template>
    <button {{on "click" (fn this.handleClick @item)}}>Click</button>
  </template>
}
```

## Conversion Patterns

### Pattern 1: Glimmer Component with Template

**Before** (two files):

```js
// app/components/my-widget.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MyWidgetComponent extends Component {
  @service store;
  @tracked isOpen = false;

  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
```

```hbs
{{! app/components/my-widget.hbs }}
<div data-test-my-widget>
  <button {{on "click" this.toggle}}>
    {{if this.isOpen "Close" "Open"}}
  </button>
  {{#if this.isOpen}}
    <p>{{@content}}</p>
  {{/if}}
</div>
```

**After** (single file):

```gjs
// app/components/my-widget.gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

export default class MyWidgetComponent extends Component {
  @service store;
  @tracked isOpen = false;

  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }

  <template>
    <div data-test-my-widget>
      <button {{on "click" this.toggle}}>
        {{if this.isOpen "Close" "Open"}}
      </button>
      {{#if this.isOpen}}
        <p>{{@content}}</p>
      {{/if}}
    </div>
  </template>
}
```

### Pattern 2: Template-only Component

**Before:**

```hbs
{{! app/components/status-badge.hbs }}
<span class="badge badge-{{@status}}">
  {{@label}}
</span>
```

**After:**

```gjs
// app/components/status-badge.gjs
<template>
  <span class="badge badge-{{@status}}">
    {{@label}}
  </span>
</template>
```

### Pattern 3: Component with Private Helper Components

**After** (GJS allows multiple components in one file):

```gjs
// app/components/user-list.gjs
import Component from '@glimmer/component';
import { on } from '@ember/modifier';

// Private — not exported, only usable in this file
const UserRow = <template>
  <tr data-test-user-row>
    <td>{{@user.name}}</td>
    <td>{{@user.email}}</td>
  </tr>
</template>;

export default class UserList extends Component {
  <template>
    <table>
      <tbody>
        {{#each @users as |user|}}
          <UserRow @user={{user}} />
        {{/each}}
      </tbody>
    </table>
  </template>
}
```

### Pattern 4: Component Using ember-concurrency

**Before:**

```js
// app/components/workflow-basics.js
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';

export default class WorkflowBasicsComponent extends Component {
  loadNext = task({ drop: true }, async () => {
    await timeout(100);
    await this.args.validateAndLoadTab('submissions.new.grants');
  });
}
```

```hbs
{{! app/components/workflow-basics.hbs }}
<button {{on "click" (perform this.loadNext)}} disabled={{this.loadNext.isRunning}}>
  Next
</button>
```

**After:**

```gjs
// app/components/workflow-basics.gjs
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';

export default class WorkflowBasicsComponent extends Component {
  loadNext = task({ drop: true }, async () => {
    await timeout(100);
    await this.args.validateAndLoadTab('submissions.new.grants');
  });

  <template>
    <button {{on "click" (perform this.loadNext)}} disabled={{this.loadNext.isRunning}}>
      Next
    </button>
  </template>
}
```

### Pattern 5: Component Using did-insert/did-update

```gjs
// app/components/metadata-form.gjs
import Component from '@glimmer/component';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import didUpdate from '@ember/render-modifiers/modifiers/did-update';

export default class MetadataFormComponent extends Component {
  @service('metadata-schema') schemaService;

  setupForm = (element) => {
    // Initialize SurveyJS on the element
  };

  <template>
    <div
      {{didInsert this.setupForm}}
      {{didUpdate this.setupForm @schema @data}}
      data-test-metadata-form
    >
    </div>
  </template>
}
```

## Common Pitfalls

### 1. Forgetting to Import `on`

The `{{on}}` modifier is a global in loose mode (`.hbs`) but must be imported in strict mode (`.gjs`). This is the single most common conversion error.

### 2. Using `this.` for Args

In templates, args use `@argName` not `this.args.argName`. This doesn't change between `.hbs` and `.gjs` — but when refactoring, don't accidentally switch conventions.

### 3. String-Based Component Lookup

Classic Ember allows `{{component "my-component"}}` with a string name. In strict mode, components must be imported and passed as values:

```gjs
import MyComponent from './my-component';

<template>
  {{#let MyComponent as |Comp|}}
    <Comp @data={{@data}} />
  {{/let}}
</template>
```

Dynamic component resolution by string is not available in strict mode. If the codebase uses this pattern, it requires refactoring.

### 4. Helper vs Component Ambiguity

In loose mode, `{{my-thing}}` could be a helper or component. In strict mode, the import clarifies which it is. When converting, verify whether each template global is a helper invocation or a component invocation.

### 5. Test File Updates

When converting a component to `.gjs`, update the corresponding test file's import path. The component import changes but the test helpers and rendering approach stay the same.

## ESLint Configuration for GJS/GTS

```js
// .eslintrc.js additions
{
  overrides: [
    {
      files: ['**/*.gjs'],
      parser: 'ember-eslint-parser',
      plugins: ['ember'],
      extends: ['plugin:ember/recommended'],
    },
    {
      files: ['**/*.gts'],
      parser: 'ember-eslint-parser',
      plugins: ['ember'],
      extends: ['plugin:ember/recommended'],
    },
  ],
}
```

Ensure `eslint-plugin-ember` is v12+ and `ember-eslint-parser` is installed.

## Migration Ordering for pass-ui

Recommended conversion order (leaf-first, dependency-aware):

1. **Simple display components** — `status-badge`, `policy-card`, `repository-card`, `grant-link-cell`, `submission-action-cell`
2. **Form-adjacent components** — `found-manuscripts`, `external-repo-review`
3. **Workflow step components** — `workflow-basics`, `workflow-grants`, `workflow-policies`, `workflow-repositories`, `workflow-metadata`, `workflow-files`, `workflow-review`
4. **Layout components** — `nav-bar`
5. **Complex components** — `metadata-form` (SurveyJS integration)

Test each conversion individually before moving to the next.
