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

    this['route'].store = {
      request: (req: { url: string }) => {
        const url = req.url;
        if (url.includes('/data/grant')) {
          assert.true(url.includes('page'), 'Grant query should have pagination');
          return Promise.resolve({ content: { data: [] } });
        } else if (url.includes('/data/submission')) {
          assert.false(url.includes('page'), 'Submission query should not have pagination');
          return Promise.resolve({ content: { data: [] } });
        }
        assert.ok(false, 'Only "grant" and "submission" requests are expected');
        return Promise.resolve({ content: { data: [] } });
      },
    };
    await this['route'].model({});
  });

  test('Submissions should be mapped to grants', async function (assert) {
    this['route'].store = {
      request: (req: { url: string }) => {
        const url = req.url;
        if (url.includes('/data/grant')) {
          return Promise.resolve({ content: { data: [{ id: 0 }, { id: 1 }] } });
        } else if (url.includes('/data/submission')) {
          return Promise.resolve({
            content: {
              data: [
                { id: 10, grants: [{ id: 0 }] },
                { id: 11, grants: [{ id: 0 }] },
              ],
            },
          });
        }
        assert.ok(false);
        return Promise.resolve({ content: { data: [] } });
      },
    };

    const result = await this['route'].model({});
    assert.equal(result.grantMap.length, 2);
    assert.equal(result.grantMap[0].submissions.length, 2);
    assert.equal(result.grantMap[1].submissions.length, 0);
  });
});
