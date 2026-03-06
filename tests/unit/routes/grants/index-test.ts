/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | grants/index', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this['route'] = this.owner.lookup('route:grants/index');
    this['route'].currentUser = {
      user: { id: 0, isAdmin: false, isSubmitter: true },
    };
  });

  test('Makes two requests', async function (assert) {
    assert.expect(2);

    let requestCount = 0;
    this['route'].store = {
      request: (req: any) => {
        const { type, query } = req.data;
        requestCount++;
        switch (type) {
          case 'grant':
            assert.deepEqual(query.page, { number: 1, size: 10, totals: true }, 'Grant query should have pagination');
            return Promise.resolve({ content: [] });
          case 'submission':
            assert.notOk(query.page, 'Submission query should not have pagination');
            return Promise.resolve({ content: [] });
          default:
            assert.ok(false, 'Only "grant" and "submission" requests are expected');
        }
        return Promise.resolve({ content: [] });
      },
    };
    await this['route'].model({});
  });

  test('Submissions should be mapped to grants', async function (assert) {
    this['route'].store = {
      request: (req: any) => {
        const { type } = req.data;
        switch (type) {
          case 'grant':
            return Promise.resolve({ content: [{ id: 0 }, { id: 1 }] });
          case 'submission':
            return Promise.resolve({
              content: [
                { id: 10, grants: [{ id: 0 }] },
                { id: 11, grants: [{ id: 0 }] },
              ],
            });
          default:
            assert.ok(false);
            return Promise.resolve({ content: [] });
        }
      },
    };

    const result = await this['route'].model({});
    assert.equal(result.grantMap.length, 2);
    assert.equal(result.grantMap[0].submissions.length, 2);
    assert.equal(result.grantMap[1].submissions.length, 0);
  });
});
