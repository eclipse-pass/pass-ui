import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | grants/index', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.route = this.owner.lookup('route:grants/index');
    this.route.currentUser = {
      user: { id: 0, isAdmin: false, isSubmitter: true },
    };
  });

  test('Makes two requests', async function (assert) {
    assert.expect(2);

    this.route.store = {
      query: (model, query) => {
        switch (model) {
          case 'grant':
            assert.deepEqual(query.page, { number: 1, size: 10, totals: true }, 'Grant query should have pagination');
            break;
          case 'submission':
            assert.notOk(query.page, 'Submission query should not have pagination');
            break;
          default:
            assert.ok(false, 'Only "grant" and "submission" requests are expected');
        }
        return Promise.resolve([]);
      },
    };
    await this.route.model({});
  });

  test('Submissions should be mapped to grants', async function (assert) {
    this.route.store = {
      query: (model, query) => {
        switch (model) {
          case 'grant':
            return Promise.resolve([{ id: 0 }, { id: 1 }]);
          case 'submission':
            return Promise.resolve([
              { id: 10, grants: [{ id: 0 }] },
              { id: 11, grants: [{ id: 0 }] },
            ]);
          default:
            assert.ok(false);
            return Promise.resolve([]);
        }
      },
    };

    const result = await this.route.model({});
    assert.equal(result.grantMap.length, 2);
    assert.equal(result.grantMap[0].submissions.length, 2);
    assert.equal(result.grantMap[1].submissions.length, 0);
  });
});
