import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-overview-doi', 'Integration | Component | submission overview', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-overview-doi}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#submission-overview-doi}}
      template block text
    {{/submission-overview-doi}}
  `);

  assert.ok(this.$());
});
