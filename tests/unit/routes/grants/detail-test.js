import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | grants/detail', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.route = this.owner.lookup('route:grants/detail');
    this.route.currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  test('Make sure grant and submissions are requested correctly', async function (assert) {
    assert.expect(4);

    this.route.store = {
      findRecord: (model, id) => {
        assert.equal(model, 'grant', 'Only grant should be requested via "findRecord"');
        assert.equal(id, 0);
        return Promise.resolve({});
      },
      query: (model, query) => {
        assert.equal(model, 'submission', 'Only submission should be queried');
        assert.deepEqual(query.page, { number: 1, size: 10, totals: true }, 'Should have pagination in query');
        return Promise.resolve({});
      },
    };

    await this.route.model({ grant_id: '0' });
  });
});
