import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submission nav', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.loadTab = () => assert.ok(true);

    await render(hbs`<SubmissionNav @loadTab={{this.loadTab}} />`);

    assert.ok(true);
  });
});
