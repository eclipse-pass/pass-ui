import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | repository card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const repository = Ember.Object.create();
    this.set('repository', repository);
    await render(hbs`{{repository-card repository=repository}}`);

    assert.ok(true);
  });

  test('Choice repo renders a checkbox', async function (assert) {
    assert.expect(2);

    this.set('selected', true);
    this.set('repository', Ember.Object.create());

    await render(hbs`{{repository-card
      repository=repository
      choice=true
      selected=selected}}`);

    assert.ok(this.element.textContent.includes('required by'), 'Failed to render');
    assert.ok(this.element.querySelector('input[type="checkbox"]'), 'No checkbox found');
  });
});
