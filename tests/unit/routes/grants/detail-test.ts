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
        // Extract resource type from URL path: /data/<type>/...
        const pathMatch = (req.url as string).match(/\/data\/(\w+)/);
        const type = pathMatch ? pathMatch[1] : 'unknown';
        assert.step(`${req.op}:${type}`);

        return Promise.resolve({ content: { data: {} } });
      },
    };

    await this['route'].model({ grant_id: '0' });

    assert.verifySteps(['findRecord:grant', 'query:submission']);
  });
});
