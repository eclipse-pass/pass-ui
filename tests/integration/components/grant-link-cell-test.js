import { moduleForComponent, test, setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';


module('Integration | Component | grant-link-cell', (hooks) => {
  setupRenderingTest(hooks);
  test('it renders', async (assert) => {
    await render(hbs`{{grant-link-cell}}`);
    assert.ok(true);
  });
});
