import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

class MockConfigService extends Service {
  getStaticConfig() {
    return Promise.resolve({ branding: { stylesheet: '', pages: { faqUrl: '' } } });
  }
  addCss() {}
}

module('Unit | Controller | submissions/index', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:app-static-config', MockConfigService);

    this.controller = this.owner.lookup('controller:submissions/index');
    this.controller.currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  test('properly returns admin roles', function (assert) {
    this.controller.currentUser = { user: { id: 0, isAdmin: true, isSubmitter: true } };
    assert.strictEqual(this.controller.columns.length, 6, 'Should get admin columns (with 6 cols)');
  });

  test('properly returns submitter roles', function (assert) {
    assert.strictEqual(this.controller.get('columns.length'), 7, 'Should get submitter columns (with 7 cols)');
  });

  /**
   * Would be more helpful in an Acceptance test in order to check
   * that URL query params are also updated
   */
  test('displayAction updates tracked query params', function (assert) {
    assert.equal(this.controller.page, 1, 'Page param should have default value');
    assert.equal(this.controller.pageSize, 10, 'Page size param should have default value');

    this.controller.send('displayAction', { currentPageNumber: 10, pageSize: 2 });

    assert.equal(this.controller.page, 10, 'Page param should be updated');
    assert.equal(this.controller.pageSize, 2, 'Page size param should be updated');
  });

  test('doQuery makes a store query', async function (assert) {
    assert.expect(4);

    this.controller.store = {
      query: (model, query) => {
        assert.equal(model, 'submission', 'Only submissions should be queried');
        assert.ok(query.page, 'Query should have pagination info');
        return Promise.resolve({});
      },
    };

    // Not called from a route's model hook, so no queued model
    assert.notOk(this.controller.queuedModel, 'Queued model undefined');
    // Don't actually need any params sent
    await this.controller.doQuery({});

    assert.deepEqual(this.controller.queuedModel, { submissions: {}, meta: undefined }, 'Queued model updated');
  });
});
