
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('date-formatter', 'helper:date-formatter', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  let date = new Date();
  date.setUTCMonth(0);
  date.setUTCDate(1);
  date.setUTCFullYear(2018);

  this.set('inputValue', date);

  this.render(hbs`{{date-formatter inputValue}}`);

  assert.equal(this.$().text().trim(), '1/1/2018');
});
