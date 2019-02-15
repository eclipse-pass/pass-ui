import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | grant-link-cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await this.render(hbs`{{grant-link-cell}}`);
    assert.ok(true);
  });
});
