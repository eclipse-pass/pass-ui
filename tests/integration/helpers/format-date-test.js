import { render, find } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | format date', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // eslint-disable-line
    this.set('inputValue', 'August 19, 1975 23:15:30');

    await render(hbs`{{format-date this.inputValue}}`);

    assert.strictEqual(this.element.textContent.trim(), '08/19/1975');
  });
});
