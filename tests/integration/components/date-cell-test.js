import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | date cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Template usage:
    this.render(hbs`{{date-cell}}`);
    assert.ok(true);
  });
});
