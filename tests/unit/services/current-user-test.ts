import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-user', (hooks) => {
  setupTest(hooks);

  test('load', function (assert) {
    const service = this.owner.lookup('service:current-user');
    assert.ok(service);

    const user = {
      id: '000',
      username: 'hvu',
      email: 'hvu@example.com',
    };

    const result = {
      '@id': user.id,
    };

    service.session = { data: { authenticated: { id: '000' } } };

    service.store = {
      request(req: { url: string }) {
        assert.ok(true);
        assert.true(req.url.includes('/data/user/'), 'URL includes user path');
        assert.true(req.url.includes(user.id), 'URL includes user id');

        return Promise.resolve({ content: { data: user } });
      },
    };

    assert.expect(5);

    return service.load.perform().then(() => {
      assert.strictEqual(service.user.id, user.id);
    });
  });
});
