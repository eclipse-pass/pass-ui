import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | format date', (hooks) => {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) { // eslint-disable-line
    this.set('inputValue', 'August 19, 1975 23:15:30');

    await this.render(hbs`{{format-date inputValue}}`);

    assert.equal(this.$().text().trim(), '08/19/1975');
  });
});
