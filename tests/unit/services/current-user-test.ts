/* eslint-disable @typescript-eslint/no-explicit-any */
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
      request(req: any) {
        assert.ok(true);
        assert.strictEqual(req.data.record.type, 'user');
        assert.strictEqual(req.data.record.id, user.id);

        return Promise.resolve({ content: user });
      },
    };

    assert.expect(5);

    return service.load.perform().then(() => {
      assert.strictEqual(service.user.id, user.id);
    });
  });
});
