import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | repository card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const repository = EmberObject.create();
    this.set('repository', repository);
    await render(hbs`{{repository-card repository=repository}}`);

    assert.ok(true);
  });

  test('Choice repo renders a checkbox', async function (assert) {
    assert.expect(1);

    this.set('selected', true);
    this.set('repository', EmberObject.create({ _selected: true }));

    await render(hbs`{{repository-card
      repository=repository
      choice="true"}}`);

    assert.ok(this.element.querySelector('input[type="checkbox"]'), 'No checkbox found');
  });

  test('Selected repos are checked by default', async function (assert) {
    this.set('repository', EmberObject.create({ _selected: true }));

    await render(hbs`{{repository-card repository=repository choice=true}}`);
    assert.ok(this.element.querySelector('input[type="checkbox"]').checked, 'Checkbox should be checked');
  });

  test('Repos that are not "selected" are unchecked by default', async function (assert) {
    this.set('repository', EmberObject.create({ _selected: false }));

    await render(hbs`{{repository-card repository=repository choice=true}}`);
    assert.notOk(this.element.querySelector('input[type="checkbox"]').checked, 'Checkbox should NOT be checked');
  });

  test('Clicking bubbles the "toggleRepository" action with a Repository and status', async function (assert) {
    assert.expect(4);

    const repo = EmberObject.create({ name: 'Moo-pository', _selected: false });
    this.set('repository', repo);

    this.set('toggleRepository', (repository, status) => {
      // assert.equal(action, 'toggleRepository', 'unexpected action');
      assert.equal(repository, repo, 'Unexpected repository found');
      assert.ok(status, 'Unexpected status found');
    });

    await render(hbs`{{repository-card
      repository=repository
      choice="true"
      toggleRepository=toggleRepository}}`);
    assert.ok(true, 'failed to render');

    const checkbox = this.element.querySelector('input[type="checkbox"]');
    assert.ok(checkbox, 'no checkbox found');
    await click(checkbox);
    // The toggleRepository action should be triggered
  });
});
