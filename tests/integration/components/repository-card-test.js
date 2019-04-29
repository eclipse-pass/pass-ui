import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('repository-card', 'Integration | Component | repository card', {
  integration: true
});

test('it renders', (assert) => {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{repository-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#repository-card}}
      template block text
    {{/repository-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
