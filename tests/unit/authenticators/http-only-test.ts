/* eslint-disable @typescript-eslint/no-explicit-any */
import HttpOnly from 'pass-ui/authenticators/http-only';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';

module('HttpOnlyAuthenticator', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let authenticator: any;

  hooks.beforeEach(function () {
    authenticator = HttpOnly.create();
  });

  module('#restore', function () {
    test('returns a resolving promise', async function (assert) {
      this.server.get('/user/whoami', (_schema: any, _request: any) => {
        return {
          id: '0',
        };
      });

      const response = await authenticator.restore({ id: '0' });
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });

    test('returns a resolving promise even when whoami response is not normalized', async function (assert) {
      this.server.get('/user/whoami', (_schema: any, _request: any) => {
        return {
          user: { id: '0' },
        };
      });

      const response = await authenticator.restore({ id: '0' });
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });
  });

  module('#authenticate', function () {
    test('returns a resolving promise', async function (assert) {
      this.server.get('/user/whoami', (_schema: any, _request: any) => {
        return {
          id: '0',
        };
      });

      const response = await authenticator.authenticate();
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });

    test('returns a resolving promise even when whoami response is not normalized', async function (assert) {
      this.server.get('/user/whoami', (_schema: any, _request: any) => {
        return {
          user: { id: '0' },
        };
      });

      const response = await authenticator.authenticate();
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });
  });
});
