import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | select row toggle', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SelectRowToggle />`);

    assert.ok(true);
  });
});
