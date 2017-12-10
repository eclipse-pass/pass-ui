import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('policy-compliance-nsf', 'Integration | Component | policy compliance nsf', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{policy-compliance-nsf}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#policy-compliance-nsf}}
      template block text
    {{/policy-compliance-nsf}}
  `);

  assert.ok(this.$());
});
