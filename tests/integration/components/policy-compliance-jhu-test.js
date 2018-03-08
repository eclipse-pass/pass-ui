import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('policy-compliance-jhu', 'Integration | Component | policy compliance jhu', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{policy-compliance-jhu}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#policy-compliance-jhu}}
      template block text
    {{/policy-compliance-jhu}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
