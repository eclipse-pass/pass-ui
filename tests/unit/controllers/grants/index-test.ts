/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

class MockConfigService extends Service {
  get config() {
    return { branding: { stylesheet: '', pages: { faqUrl: '' } } };
  }
  addCss() {}
}

module('Unit | Controller | grants/index', (hooks) => {
  setupTest(hooks);

  let controller: any;

  hooks.beforeEach(function () {
    this.owner.register('service:app-static-config', MockConfigService);

    controller = this.owner.lookup('controller:grants/index');
    controller.currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  test('handleTableChange updates tracked query params', function (assert) {
    controller.store = {
      query: () => Promise.resolve([]),
    };

    assert.equal(controller.page, 1, 'Page param should have default value');
    assert.equal(controller.pageSize, 10, 'Page size param should have default value');

    controller.handleTableChange({ page: 10, pageSize: 2, filter: '' });

    assert.equal(controller.page, 10, 'Page param should be updated');
    assert.equal(controller.pageSize, 2, 'Page size param should be updated');
  });

  test('fetchData', async function (assert) {
    assert.expect(8);

    controller.store = {
      query: (model: any, query: any) => {
        switch (model) {
          case 'grant':
            assert.ok(query.page, 'Query should have pagination info');
            return Promise.resolve([{ id: 10 }, { id: 11 }]);
          case 'submission':
            assert.notOk(query.page, 'Query should not have pagination info');
            return Promise.resolve([
              { id: 20, grants: [{ id: 11 }] },
              { id: 21, grants: [{ id: 11 }] },
            ]);
          default:
            assert.ok(false, 'Only submissions and grants should be queried here');
        }
        return Promise.resolve({});
      },
    };

    assert.notOk(controller.queuedModel, 'Queued model should be empty');

    await controller.fetchData();

    const result = controller.queuedModel;
    assert.ok(result.grantMap, 'Grant mapping should exist');
    assert.notOk(result.meta, 'No paging info present due to mocking');
    assert.equal(result.grantMap.length, 2, 'grantMap should have 2 grants');
    assert.equal(result.grantMap[0].submissions.length, 0, 'First grant should have 0 submissions');
    assert.equal(result.grantMap[1].submissions.length, 2, 'Second grant should have 2 submissions');
  });
});
