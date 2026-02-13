/* eslint-disable @typescript-eslint/no-explicit-any */
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click, waitFor } from '@ember/test-helpers';
module('Integration | Component | repository card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const repository = {};
    this.set('repository', repository);
    await render(hbs`<RepositoryCard @repository={{this.repository}} />`);

    assert.ok(true);
  });

  test('Choice repo renders a checkbox', async function (assert) {
    assert.expect(1);

    this.set('selected', true);
    this.set('repository', { _selected: true });

    await render(hbs`<RepositoryCard @repository={{this.repository}} @choice={{true}} />`);

    assert.ok(this.element.querySelector('input[type="checkbox"]'), 'No checkbox found');
  });

  test('Selected repos are checked by default', async function (assert) {
    this.set('repository', { _selected: true });

    await render(hbs`<RepositoryCard @repository={{this.repository}} @choice={{true}} />`);
    assert.ok(
      this.element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked,
      'Checkbox should be checked',
    );
  });

  test('Repos that are not "selected" are unchecked by default', async function (assert) {
    this.set('repository', { _selected: false });

    await render(hbs`<RepositoryCard @repository={{this.repository}} @choice={{true}} />`);
    assert.notOk(
      this.element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked,
      'Checkbox should NOT be checked',
    );
  });

  test('Clicking bubbles the "toggleRepository" action with a Repository and status', async function (assert) {
    assert.expect(3);

    const repo = { name: 'Moo-pository', _selected: false };
    this.set('repository', repo);

    this.set('toggleRepository', (repository: any, selected: any, _type: any) => {
      assert.strictEqual(repository, repo, 'Repository matches');
      assert.true(selected, 'Status is selected');

      assert.dom('input[type="checkbox"]').isChecked();
    });

    await render(
      hbs`<RepositoryCard @repository={{this.repository}} @choice={{true}} @toggleRepository={{this.toggleRepository}} />`,
    );

    await waitFor('input[type="checkbox"]');
    await click('input[type="checkbox"]');
  });
});
