/* eslint-disable no-global-assign */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Service | oaManuscriptService', (hooks) => {
  setupTest(hooks);

  let realFetch;

  hooks.beforeEach(() => {
    realFetch = fetch;
  });

  hooks.afterEach(() => {
    fetch = realFetch;
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:oa-manuscript-service');
    assert.ok(service);
  });

  test('downloadManuscripts fetches and calls store.createObject', function (assert) {
    const service = this.owner.lookup('service:oa-manuscript-service');

    const testUrl = 'moo.com';

    fetch = function (url, options) {
      assert.ok(url.includes(testUrl), `URL (${url})doesn't include testUrl ${testUrl}`);
      assert.equal(options.method, 'POST');

      return Promise.resolve({
        json: () => Promise.resolve({
          [testUrl]: {
            id: 'fedora_moo_id',
            status: 200,
            name: 'This-is-a-moo.pdf',
            mimeType: 'application/moo'
          }
        })
      });
    };

    const res = service.downloadManuscripts([testUrl], 'doi');

    assert.ok(res, 'No result found');
  });
});
