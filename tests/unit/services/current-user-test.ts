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
      findRecord(type: any, id: any) {
        assert.ok(true);
        assert.strictEqual(type, 'user');
        assert.strictEqual(id, user.id);

        return new Promise((resolve) => resolve(user));
      },
    };

    assert.expect(5);

    return service.load.perform().then(() => {
      assert.strictEqual(service.user.id, user.id);
    });
  });
});
