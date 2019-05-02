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
    assert.expect(1);

    this.set('selected', true);
    this.set('repository', Ember.Object.create());

    await render(hbs`{{repository-card
      repository=repository
      choice="true"
      selected=selected}}`);

    assert.ok(this.element.querySelector('input[type="checkbox"]'), 'No checkbox found');
  });

  // test('Clicking bubbles the "toggleRepository" action with a Repository and status', async function (assert) {
  //   assert.expect(3);

  //   const repo = Ember.Object.create({ name: 'Moo-pository' });
  //   this.set('repository', repo);

  //   this.set('toggleRepository', (repository, status) => {
  //     // assert.equal(action, 'toggleRepository', 'unexpected action');
  //     assert.equal(repository, repo, 'Unexpected repository found');
  //     assert.ok(status, 'Unexpected status found');
  //   });

  //   await render(hbs`{{repository-card
  //     repository=repository
  //     choice="true"
  //     selected="false"
  //     toggleRepository=toggleRepository}}`);
  //   assert.ok(true, 'failed to render');

  //   await click('input[type="checkbox"]');
  //   // debugger
  //   // The toggleRepository action should be triggered
  // });
});
