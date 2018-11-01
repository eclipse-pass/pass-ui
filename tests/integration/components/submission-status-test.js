import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-status', 'Integration | Component | submission status', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // TODO What to check?

  this.render(hbs`{{submission-status}}`);

  assert.ok(this.$().text().trim());

  // Template block usage:
  this.render(hbs`
    {{#submission-status}}
      template block text
    {{/submission-status}}
  `);

  assert.ok(this.$().text().trim());
});
