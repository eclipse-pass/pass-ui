
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('date-formatter', 'helper:date-formatter', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  let date = new Date('2018-03-25Z');

  this.set('inputValue', date);

  this.render(hbs`{{date-formatter inputValue}}`);

  assert.equal(this.$().text().trim(), '3/25/2018');
});
