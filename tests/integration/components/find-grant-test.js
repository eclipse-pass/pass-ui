import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('find-grant', 'Integration | Component | find grant', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{find-grant}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#find-grant}}
      template block text
    {{/find-grant}}
  `);

  assert.ok(this.$());
});
