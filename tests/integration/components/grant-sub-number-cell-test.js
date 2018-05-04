import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grant-sub-number-cell', 'Integration | Component | grant sub number cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{grant-sub-number-cell}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#grant-sub-number-cell}}
      template block text
    {{/grant-sub-number-cell}}
  `);

  assert.equal(this.$().text().trim(), '');
});
