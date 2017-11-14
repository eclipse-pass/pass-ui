import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grants-action-cell', 'Integration | Component | grants action cell', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{grants-action-cell}}`);

  assert.ok(this.$().text().includes('Grant'));

  // Template block usage:
  this.render(hbs`
    {{#grants-action-cell}}
      template block text
    {{/grants-action-cell}}
  `);

  assert.ok(this.$().text().includes('Grant'));
});
