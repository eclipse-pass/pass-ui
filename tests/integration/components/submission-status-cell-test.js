import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-status-cell', 'Integration | Component | submission status cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{submission-status-cell submissionStatus="submitted"}}`);
  assert.ok(true);

  // Template block usage:
  // this.render(hbs`{{submission-status-cell status=""}}`);
});
