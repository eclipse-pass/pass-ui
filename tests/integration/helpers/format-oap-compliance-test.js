import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | format oap compliance', (hooks) => {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) { // eslint-disable-line
    this.set('inputValue', 'Yes');

    await this.render(hbs`{{format-oap-compliance inputValue}}`);

    assert.equal(this.$().text().trim(), 'Yes');
  });
});
