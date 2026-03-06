/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | grants/detail', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this['route'] = this.owner.lookup('route:grants/detail');
    this['route'].currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  test('Make sure grant and submissions are requested correctly', async function (assert) {
    assert.expect(3);

    this['route'].store = {
      request: (req: any) => {
        assert.step(`${req.op}:${req.data.record?.type ?? req.data.type}`);

        if (req.op === 'findRecord') {
          return Promise.resolve({ content: {} });
        }
        return Promise.resolve({ content: {} });
      },
    };

    await this['route'].model({ grant_id: '0' });

    assert.verifySteps(['findRecord:grant', 'query:submission']);
  });
});
