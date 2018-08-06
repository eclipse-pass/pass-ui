import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pi-list-cell', 'Integration | Component | pi list cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // Template usage:
  this.render(hbs`{{pi-list-cell}}`);
  assert.ok(true);
});
