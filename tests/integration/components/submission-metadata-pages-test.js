import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-metadata-pages', 'Integration | Component | submission metadata pages', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // Template usage:
  this.render(hbs`{{submission-metadata-pages}}`);
  assert.ok(true);
});
