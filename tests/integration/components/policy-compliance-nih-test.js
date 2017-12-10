import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('policy-compliance-nih', 'Integration | Component | policy compliance nih', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{policy-compliance-nih}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#policy-compliance-nih}}
      template block text
    {{/policy-compliance-nih}}
  `);

  assert.ok(this.$());
});
