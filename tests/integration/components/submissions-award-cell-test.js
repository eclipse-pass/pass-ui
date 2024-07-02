import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions award cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const record = {
      grants: [
        {
          id: 'test-id-1',
          detail: 'test-detail-1',
          awardNumber: 'test-awdnum-1',
          primaryFunder: { name: 'test-pfname-1' },
        },
        {
          id: 'test-id-2',
          detail: 'test-detail-2',
          awardNumber: 'test-awdnum-2',
          primaryFunder: { name: 'test-pfname-2' },
        },
      ],
    };
    this.set('record', record);

    await render(hbs`<SubmissionsAwardCell @record={{this.record}} />`);

    assert.ok(true);
    assert.equal(
      this.element.textContent.trim(),
      'test-awdnum-1\n  (test-pfname-1)\n    ,\n  test-awdnum-2\n  (test-pfname-2)',
      'render many awards correctly',
    );
  });
});
