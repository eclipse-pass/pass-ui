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
      request: () => Promise.resolve({ content: { data: [] } }),
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
      request: (req: any) => {
        const url = req.url as string;
        if (url.includes('/data/grant')) {
          assert.true(url.includes('page'), 'Query should have pagination info'); // eslint-disable-line qunit/no-conditional-assertions
          return Promise.resolve({ content: { data: [{ id: 10 }, { id: 11 }] } });
        } else if (url.includes('/data/submission')) {
          assert.false(url.includes('page'), 'Query should not have pagination info'); // eslint-disable-line qunit/no-conditional-assertions
          return Promise.resolve({
            content: {
              data: [
                { id: 20, grants: [{ id: 11 }] },
                { id: 21, grants: [{ id: 11 }] },
              ],
            },
          });
        }
        assert.ok(false, 'Only submissions and grants should be queried here');
        return Promise.resolve({ content: { data: {} } });
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
