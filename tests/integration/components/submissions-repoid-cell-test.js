import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submissions-repoid-cell', 'Integration | Component | submissions repoid cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submissions-repoid-cell}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#submissions-repoid-cell}}
    {{/submissions-repoid-cell}}
  `);

  assert.equal(this.$().text().trim(), '');
});
