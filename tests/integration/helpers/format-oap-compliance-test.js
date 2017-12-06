
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('format-oap-compliance', 'helper:format-oap-compliance', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', 'Yes');

  this.render(hbs`{{format-oap-compliance inputValue}}`);

  assert.equal(this.$().text().trim(), 'Yes');
});
