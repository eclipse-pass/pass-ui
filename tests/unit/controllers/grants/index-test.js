/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects */
import EmberObject from '@ember/object';
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

  hooks.beforeEach(function () {
    this.owner.register('service:app-static-config', MockConfigService);

    this.controller = this.owner.lookup('controller:grants/index');
    this.controller.currentUser = { user: { id: 0, isAdmin: false, isSubmitter: true } };
  });

  test('properly returns admin roles', function (assert) {
    this.controller.currentUser = { user: { id: 0, isAdmin: true, isSubmitter: true } };
    assert.strictEqual(
      this.controller.get('adminColumns'),
      this.controller.get('columns'),
      'Should return admin columns',
    );
  });

  test('properly returns submitter roles', function (assert) {
    assert.strictEqual(
      this.controller.get('piColumns'),
      this.controller.get('columns'),
      'Should return submitter columns',
    );
  });

  test('displayAction updates tracked query params', function (assert) {
    assert.equal(this.controller.page, 1, 'Page param should have default value');
    assert.equal(this.controller.pageSize, 10, 'Page size param should have default value');

    this.controller.send('displayAction', { currentPageNumber: 10, pageSize: 2 });

    assert.equal(this.controller.page, 10, 'Page param should be updated');
    assert.equal(this.controller.pageSize, 2, 'Page size param should be updated');
  });

  test('doQuery', async function (assert) {
    assert.expect(8);

    this.controller.store = {
      query: (model, query) => {
        // assert.equal(model, 'grant', 'Only grants should be queried');
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

    assert.notOk(this.controller.queuedModel, 'Queued model should be empty');

    await this.controller.doQuery({});

    const result = this.controller.queuedModel;
    assert.ok(result.grantMap, 'Grant mapping should exist');
    assert.notOk(result.meta, 'No paging info present due to mocking');
    assert.equal(result.grantMap.length, 2, 'grantMap should have 2 grants');
    assert.equal(result.grantMap[0].submissions.length, 0, 'First grant should have 0 submissions');
    assert.equal(result.grantMap[1].submissions.length, 2, 'Second grant should have 2 submissions');
  });
});
