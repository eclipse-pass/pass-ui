import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions article cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders a title', async function (assert) {
    let record = {
      id: 1,
      publication: {
        title: 'Balancing excitation and inhibition.',
      },
    };

    this.set('record', record);

    await render(hbs`<SubmissionsArticleCell @record={{this.record}} />`);

    assert.equal(this.element.textContent.trim(), 'Balancing excitation and inhibition.');
  });
});
