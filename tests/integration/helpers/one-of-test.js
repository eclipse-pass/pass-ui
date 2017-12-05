
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-of', 'helper:one-of', {
  integration: true
});

// Replace this with your real tests.
test('return first', function(assert) {
  this.set('one', '1234');
  this.set('two', '5678');

  this.render(hbs`{{one-of one two}}`);

  assert.equal(this.$().text().trim(), '1234');
});

test('return second', function(assert) {
  this.set('two', '5678');

  this.render(hbs`{{one-of one two}}`);

  assert.equal(this.$().text().trim(), '5678');
});

test('none', function(assert) {

  this.render(hbs`{{one-of one two}}`);

  assert.equal(this.$().text().trim(), '');
});


