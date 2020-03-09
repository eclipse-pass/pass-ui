/* eslint-disable prefer-arrow-callback */
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | grant action cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{grant-action-cell}}`);

    assert.equal(this.element.textContent.trim(), 'New submission');

    // Template block usage:
    await render(hbs`{{#grant-action-cell}}template block text{{/grant-action-cell}}`);

    assert.equal(this.element.textContent.trim(), 'New submission\ntemplate block text');
  });
});
