import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | workflow repositories', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const submission = Ember.Object.create({ repositories: Ember.A() });
    const req = Ember.A();
    const opt = Ember.A();
    const choice = Ember.A();

    this.set('submission', submission);
    this.set('requiredRepositories', req);
    this.set('optionalRepositories', opt);
    this.set('choiceRepositories', choice);
  });

  test('it renders', async (assert) => {
    await render(hbs`{{workflow-repositories
      submission=submission
      requiredRepositories=requiredRepositories
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);
    assert.ok(true);
  });

  test('required repositories should display with no checkboxes', async function (assert) {
    this.set('requiredRepositories', Ember.A([
      {
        repository: Ember.Object.create({ name: 'Moo-pository 1' })
      }
    ]));

    await render(hbs`{{workflow-repositories
      submission=submission
      requiredRepositories=requiredRepositories
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);

    assert.ok(this.element.textContent.includes('Moo-pository 1'), 'couldn\'t find repository name');

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.equal(checkboxes.length, 0, 'should be zero checkboxes rendered');
  });

  test('optional/choice repos chould display with checkboxes', async function (assert) {
    this.set('choiceRepositories', Ember.A([
      Ember.A([
        { selected: true, repository: Ember.Object.create({ name: 'Moo-pository 1' }) },
        { selected: false, repository: Ember.Object.create({ name: 'Moo-pository 2' }) }
      ])
    ]));
    this.set('optionalRepositories', Ember.A([
      { selected: false, repository: Ember.Object.create({ name: 'Moo-pository 00' }) }
    ]));

    await render(hbs`{{workflow-repositories
      submission=submission
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);

    const text = this.element.textContent;
    assert.ok(text, 'No text found');
    assert.ok(text.includes('choose between the repositories below'));
    assert.ok(text.includes('Optional repositories'));

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.equal(checkboxes.length, 3, 'unexpected # of checkboxes found');
  });

  test('User cannot deselect all choice repos', async function (assert) {
    this.set('choiceRepositories', Ember.A([
      Ember.A([
        { repository: Ember.Object.create({ name: 'Moo-pository 1', _selected: true }) },
        { repository: Ember.Object.create({ name: 'Moo-pository 2', _selected: false }) }
      ])
    ]));

    await render(hbs`{{workflow-repositories
      submission=submission
      choiceRepositories=choiceRepositories}}`);

    assert.ok(this.element, 'failed to render');

    /*
     * At this point, there is one "choice group" with one repo selected.
     * The user should not be able to unselect this repo because it is the
     * only one selected
     */
    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes[0].checked, 'first checkbox should be checked');

    await click(checkboxes[0]);

    assert.ok(checkboxes[0].checked, 'first checkbox should STILL be checked');
  });

  test('Selecting an optional repo adds it to submission', async function (assert) {
    this.set('requiredRepositories', Ember.A([
      { repository: Ember.Object.create({ name: 'Moo-pository XYZ' }) }
    ]));
    this.set('choiceRepositories', Ember.A([
      Ember.A([
        { repository: Ember.Object.create({ name: 'Moo-pository 1', _selected: true }) },
        { repository: Ember.Object.create({ name: 'Moo-pository 2', _selected: false }) }
      ])
    ]));
    this.set('optionalRepositories', Ember.A([
      { selected: false, repository: Ember.Object.create({ name: 'Moo-pository 00' }) }
    ]));

    await render(hbs`{{workflow-repositories
      submission=submission
      requiredRepositories=requiredRepositories
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);

    const repos = this.get('submission.repositories');
    assert.equal(repos.length, 2, 'unexpected number of repositories attached to the submission');
    assert.ok(repos.isAny('name', 'Moo-pository XYZ'));

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.equal(checkboxes.length, 3, 'Unexpected number of checkboxes found');

    await click(checkboxes[2]);

    assert.equal(repos.length, 3, 'unexpected number of repositories attached to submission');
    assert.ok(repos.isAny('name', 'Moo-pository 00'));
    assert.notOk(repos.includes(undefined), 'there should be no "undefined" entries');
  });

  test('Unselecting optional repo removes it from submission', async function (assert) {
    this.set('requiredRepositories', Ember.A([
      { repository: Ember.Object.create({ name: 'Moo-pository XYZ' }) }
    ]));
    this.set('choiceRepositories', Ember.A([
      Ember.A([
        { repository: Ember.Object.create({ name: 'Moo-pository 1', _selected: true }) },
        { repository: Ember.Object.create({ name: 'Moo-pository 2', _selected: false }) }
      ])
    ]));
    this.set('optionalRepositories', Ember.A([
      { repository: Ember.Object.create({ name: 'Moo-pository 00', _selected: true }) }
    ]));

    await render(hbs`{{workflow-repositories
      submission=submission
      requiredRepositories=requiredRepositories
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);

    const repos = this.get('submission.repositories');
    assert.equal(repos.length, 3, 'unexpected number of repositories attached to submission');
    assert.notOk(repos.includes(undefined), 'should be no undefined items');
    assert.ok(repos.isAny('name', 'Moo-pository 00'), 'The optional repo should be present');

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.equal(checkboxes.length, 3, 'unexpected number of checkboxes found');

    await click(checkboxes[2]);

    assert.equal(repos.length, 2, 'unexpected number of repositories attached to the submission');
    assert.notOk(repos.isAny('name', 'Moo-pository 00'));
  });
});
