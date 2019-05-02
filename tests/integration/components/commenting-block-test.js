import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | commenting block', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{commenting-block}}`);

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(hbs`
      {{#commenting-block}}
        template block text
      {{/commenting-block}}
    `);

    assert.equal(this.$().text().trim(), '');
  });
});
