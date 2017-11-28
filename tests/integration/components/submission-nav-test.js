import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-nav', 'Integration | Component | submission nav', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-nav}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-nav}}
      template block text
    {{/submission-nav}}
  `);

  assert.ok(this.$());
});
