import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('format-date', 'helper:format-date', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) { // eslint-disable-line
  this.set('inputValue', 'August 19, 1975 23:15:30');

  this.render(hbs`{{format-date inputValue}}`);

  assert.equal(this.$().text().trim(), '08/19/1975');
});
