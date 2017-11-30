
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('value-of', 'helper:value-of', {
  integration: true
});

test('simple value', function (assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{value-of inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

test('function value', function (assert) {
  this.set('inputValue', function () { return '1234' });

  this.render(hbs`{{value-of inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});


