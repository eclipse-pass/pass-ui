import HttpOnly from 'pass-ui/authenticators/http-only';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('HttpOnlyAuthenticator', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let authenticator;

  hooks.beforeEach(function () {
    authenticator = HttpOnly.create();
  });

  module('#restore', function () {
    test('returns a resolving promise', async function (assert) {
      server.get('/user/whoami', (_schema, _request) => {
        return {
          id: '0',
        };
      });

      const response = await authenticator.restore({ id: '0' });
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });

    test('returns a resolving promise even when whoami response is not normalized', async function (assert) {
      server.get('/user/whoami', (_schema, _request) => {
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
      server.get('/user/whoami', (_schema, _request) => {
        return {
          id: '0',
        };
      });

      const response = await authenticator.authenticate();
      const expectedResponse = { id: '0' };

      assert.strictEqual(response.id, expectedResponse.id);
    });

    test('returns a resolving promise even when whoami response is not normalized', async function (assert) {
      server.get('/user/whoami', (_schema, _request) => {
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
