import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | policy card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders when given expected data', async function (assert) {
    assert.expect(4);

    const policy = Ember.Object.create({
      repositories: Ember.A(),
      description: 'This is a moo-scription',
      title: 'Moo title'
    });
    const journal = Ember.Object.create({
      isMethodA: false
    });
    const submission = Ember.Object.create({
      effectivePolicies: Ember.A()
    });

    // this.set('workflow', workflow);
    this.set('policy', policy);
    this.set('journal', journal);
    this.set('submission', submission);

    await render(hbs`{{policy-card policy=policy journal=journal submission=submission}}`);
    assert.ok(true);

    const text = this.element.textContent;

    assert.ok(text, 'no text content found');
    assert.ok(text.includes('Requires deposit into'), 'Start of repo list not found');
    assert.ok(text.includes('moo-scription'), 'Description fragment not found');
  });

  test('PMC journal displays user input', async function (assert) {
    // TODO: May have to change after fully integrating Policy service
    const policy = Ember.Object.create({
      repositories: Ember.A([Ember.Object.create({
        repositoryKey: 'pmc'
      })]),
      description: 'This is a moo-scription',
      title: 'Moo title'
    });
    const journal = Ember.Object.create({
      isMethodA: false
    });
    const submission = Ember.Object.create({
      effectivePolicies: Ember.A()
    });

    this.set('policy', policy);
    this.set('journal', journal);
    this.set('submission', submission);

    // this.set('usesPmcRepository', true);
    this.set('methodAJournal', false);

    await render(hbs`{{policy-card policy=policy journal=journal submission=submission}}`);
    assert.ok(true);

    const inputs = this.element.querySelectorAll('input');
    assert.equal(inputs.length, 2, `Found ${inputs.length} inputs, but was expecting 2`);
  });
});
