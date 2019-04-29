import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | workflow repositories', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const submission = Ember.Object.create();
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

  // Should display required repos without checkbox

  // Should display optional/choice with checkbox

  // User cannot deselect all choice repos

  // Selecting an optional repo adds it to submission
});
