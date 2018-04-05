import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('oap-compliance-cell', 'Integration | Component | oap compliance cell', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{oap-compliance-cell}}`);

  assert.equal(this.$().text().trim(), '');
});
