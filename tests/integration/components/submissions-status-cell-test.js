import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | submissions status cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{submissions-status-cell submissionStatus="submitted"}}`);
    assert.ok(true);

    // Template block usage:
    // this.render(hbs`{{submissions-status-cell status=""}}`);
  });
});
