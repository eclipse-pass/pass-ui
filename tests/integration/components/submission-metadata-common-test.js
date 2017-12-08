import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-metadata-common', 'Integration | Component | submission metadata common', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-metadata-common}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-metadata-common}}
      template block text
    {{/submission-metadata-common}}
  `);

  assert.ok(this.$());
});
