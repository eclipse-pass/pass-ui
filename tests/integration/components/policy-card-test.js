/* eslint-disable ember/no-get */
import { A } from '@ember/array';
import EmberObject, { get } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | policy card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders when given expected data', async function (assert) {
    const policy = EmberObject.create({
      repositories: A(),
      description: 'This is a moo-scription',
      title: 'Moo title',
      id: 1,
    });

    const journal = EmberObject.create({
      isMethodA: false,
    });
    const submission = EmberObject.create({
      effectivePolicies: A(),
    });

    this.set('policy', policy);
    this.set('journal', journal);
    this.set('submission', submission);

    await render(hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`);

    assert.dom(this.element).includesText('Requires deposit into');
    assert.dom(this.element).includesText('moo-scription');
  });

  module('PMC tests', (hooks) => {
    hooks.beforeEach(function () {
      const policy = EmberObject.create({
        repositories: A([
          EmberObject.create({
            repositoryKey: 'pmc',
          }),
        ]),
        description: 'This is a moo-scription',
        title: 'Moo title',
      });
      const journal = EmberObject.create({
        isMethodA: false,
      });
      const submission = EmberObject.create({
        effectivePolicies: A(),
      });

      this.set('policy', policy);
      this.set('journal', journal);
      this.set('submission', submission);
    });

    test('PMC journal displays user input', async function (assert) {
      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`
      );

      const inputs = this.element.querySelectorAll('input');
      assert.strictEqual(inputs.length, 2, `Found ${inputs.length} inputs, but was expecting 2`);

      const effectivePolicies = get(this, 'submission.effectivePolicies');
      assert.strictEqual(effectivePolicies.length, 1, 'Should be ONE effective policy on submission');
      assert.ok(effectivePolicies.isAny('title', 'Moo title'));
    });

    test('PMC non-type A can be removed', async function (assert) {
      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`
      );

      const inputs = this.element.querySelectorAll('input');
      assert.strictEqual(inputs.length, 2, `Found ${inputs.length} inputs, but was expecting 2`);

      // Select option to remove this policy
      await click(inputs[1]);

      const effectivePolicies = get(this, 'submission.effectivePolicies');
      assert.strictEqual(effectivePolicies.length, 0, 'Should be ZERO effective policies');
    });

    test('PMC type A journal as no inputs and is not added to submission', async function (assert) {
      this.set('journal', EmberObject.create({ isMethodA: true }));

      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`
      );
      assert.ok(this.element, 'failed to render');

      const inputs = this.element.querySelectorAll('input');
      assert.strictEqual(inputs.length, 0, 'should be ZERO input options rendered');

      assert.strictEqual(get(this, 'submission.effectivePolicies').length, 0, 'should be ZERO effective policies set');
    });
  });
});
