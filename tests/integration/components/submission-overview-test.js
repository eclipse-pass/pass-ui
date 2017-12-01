import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-overview', 'Integration | Component | submission overview', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-overview}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-overview}}
      template block text
    {{/submission-overview}}
  `);

  assert.ok(this.$());
});
