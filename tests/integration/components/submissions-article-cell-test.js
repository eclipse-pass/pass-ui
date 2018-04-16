import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submissions-article-cell', 'Integration | Component | submissions article cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submissions-article-cell}}`);

  assert.equal(this.$().text().trim(), '');

  this.set('record', { id: '1', title: 'Moo' });

  this.render(hbs`{{submissions-article-cell record=record}}`);
  assert.equal(this.$().text().trim(), 'Moo');
});
