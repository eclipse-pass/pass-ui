import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-funding-table', 'Integration | Component | submission funding table', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-funding-table}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-funding-table}}
      template block text
    {{/submission-funding-table}}
  `);

  assert.ok(this.$());
});
