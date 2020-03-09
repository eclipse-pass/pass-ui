import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions status cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{submissions-status-cell submissionStatus="submitted"}}`);
    assert.ok(true);

    // Template block usage:
    // this.render(hbs`{{submissions-status-cell status=""}}`);
  });

  test('draft submission renders', async function (assert) {
    const record = EmberObject.create({
      submissionStatus: 'draft'
    });
    this.set('record', record);

    await render(hbs`{{submissions-status-cell record=record}}`);

    assert.ok(this.element, 'Failed to render');
    assert.ok(this.element.textContent.includes('draft'), 'unexpected text found');
  });
});
