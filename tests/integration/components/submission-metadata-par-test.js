import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-metadata-par', 'Integration | Component | submission metadata par', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-metadata-par}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-metadata-par}}
      template block text
    {{/submission-metadata-par}}
  `);

  assert.ok(this.$());
});
