import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions status cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`<SubmissionsStatusCell @submissionStatus="submitted" />`);
    assert.ok(true);
  });

  test('draft submission renders', async function (assert) {
    const record = {
      submissionStatus: 'draft',
    };
    this.set('record', record);

    await render(hbs`<SubmissionsStatusCell @record={{this.record}} />`);

    assert.ok(this.element, 'Failed to render');
    assert.ok(this.element.textContent.includes('draft'), 'unexpected text found');
  });
});
