
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

const Thing = EmberObject.extend({});

moduleForComponent('auto-fill', 'helper:auto-fill', {
  integration: true
});

// Replace this with your real tests.
test('has value test', function (assert) {
  this.set('obj', Thing.create({ field: '1234' }));

  this.render(hbs`{{auto-fill obj "field" "5678"}}`);

  assert.equal(this.$().text().trim(), '1234');
});

test('default value test', function (assert) {
  this.set('obj', Thing.create());

  this.render(hbs`{{auto-fill obj "field" "1234"}}`);

  assert.equal(this.$().text().trim(), '1234');
});

test('no value test', function (assert) {
  this.set('obj', Thing.create());

  this.render(hbs`{{auto-fill obj "field"}}`);

  assert.equal(this.$().text().trim(), '');
});
