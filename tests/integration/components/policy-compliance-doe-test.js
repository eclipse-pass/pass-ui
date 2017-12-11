import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('policy-compliance-doe', 'Integration | Component | policy compliance doe', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{policy-compliance-doe}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#policy-compliance-doe}}
      template block text
    {{/policy-compliance-doe}}
  `);

  assert.ok(this.$());
});
