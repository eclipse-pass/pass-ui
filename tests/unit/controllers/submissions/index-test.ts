import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

class MockConfigService extends Service {
  get config() {
    return { branding: { stylesheet: '', pages: { faqUrl: '' } } };
  }
  addCss() {}
}

module('Unit | Controller | submissions/index', function (hooks) {
  setupTest(hooks);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- owner.lookup() returns untyped controller instance
  let controller: any;

  hooks.beforeEach(function () {
    this.owner.register('service:app-static-config', MockConfigService);

    controller = this.owner.lookup('controller:submissions/index');
    controller.currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  /**
   * Would be more helpful in an Acceptance test in order to check
   * that URL query params are also updated
   */
  test('handleTableChange updates tracked query params', function (assert) {
    controller.store = { request: () => Promise.resolve({ content: { data: [] } }) };

    assert.equal(controller.page, 1, 'Page param should have default value');
    assert.equal(controller.pageSize, 10, 'Page size param should have default value');

    controller.handleTableChange({ page: 10, pageSize: 2, filter: '' });

    assert.equal(controller.page, 10, 'Page param should be updated');
    assert.equal(controller.pageSize, 2, 'Page size param should be updated');
  });

  test('fetchData makes a store query', async function (assert) {
    assert.expect(4);

    controller.store = {
      request: (req: { url: string }) => {
        const url = req.url;
        assert.true(url.includes('/data/submission'), 'Only submissions should be queried');
        assert.true(url.includes('page'), 'Query should have pagination info');
        return Promise.resolve({ content: { data: {} } });
      },
    };

    // Not called from a route's model hook, so no queued model
    assert.notOk(controller.queuedModel, 'Queued model undefined');
    await controller.fetchData();

    assert.deepEqual(controller.queuedModel, { submissions: {}, meta: undefined }, 'Queued model updated');
  });
});
