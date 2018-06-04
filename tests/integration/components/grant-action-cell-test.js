import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grant-action-cell', 'Integration | Component | grant action cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{grant-action-cell}}`);

  assert.equal(this.$().text().trim(), 'New Submission');

  // Template block usage:
  this.render(hbs`{{#grant-action-cell}}template block text{{/grant-action-cell}}`);

  assert.equal(this.$().text().trim(), 'New Submission\ntemplate block text');
});
