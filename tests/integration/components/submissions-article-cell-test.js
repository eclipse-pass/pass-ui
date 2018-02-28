import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submissions-article-cell', 'Integration | Component | submissions article cell', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submissions-article-cell}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#submissions-article-cell}}
      template block text
    {{/submissions-article-cell}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
