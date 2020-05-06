/* eslint-disable no-global-assign */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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

  test('downloadManuscript fetches', function (assert) {
    const service = this.owner.lookup('service:oa-manuscript-service');

    const testUrl = 'moo.com';

    fetch = function (url, options) {
      assert.ok(url.includes(testUrl), `URL (${url})doesn't include testUrl ${testUrl}`);
      assert.equal(options.method, 'POST');

      return Promise.resolve({
        text: () => 'fedora_moo_id',
        ok: true
      });
    };

    const res = service.downloadManuscript(testUrl, 'doi');

    assert.ok(res, 'No result found');
  });
});
