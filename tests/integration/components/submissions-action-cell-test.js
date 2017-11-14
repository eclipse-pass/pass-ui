import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submissions-action-cell', 'Integration | Component | submissions action cell', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submissions-action-cell}}`);

  assert.ok(this.$().text().includes('Submission'));

  // Template block usage:
  this.render(hbs`
    {{#submissions-action-cell}}
      template block text
    {{/submissions-action-cell}}
  `);

  assert.ok(this.$().text().includes('Submission'));
});
