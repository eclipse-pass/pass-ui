import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('find-journal', 'Integration | Component | find journal', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{find-journal}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#find-journal}}
      template block text
    {{/find-journal}}
  `);

  assert.ok(this.$());
});
