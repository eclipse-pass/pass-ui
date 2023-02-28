import EmberObject from '@ember/object';
import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-user', (hooks) => {
  setupTest(hooks);

  test('load', function (assert) {
    const service = this.owner.lookup('service:current-user');
    assert.ok(service);

    let user = EmberObject.create({
      id: '000',
      username: 'hvu',
      email: 'hvu@example.com',
    });

    let result = {
      '@id': user.get('id'),
    };

    service.set('session', { data: { authenticated: { user: { id: '000' } } } });

    service.set(
      'store',
      EmberObject.create({
        findRecord(type, id) {
          assert.ok(true);
          assert.strictEqual(type, 'user');
          assert.strictEqual(id, user.get('id'));

          return new Promise((resolve) => resolve(user));
        },
      })
    );

    assert.expect(5);

    return service
      .get('load')
      .perform()
      .then(() => {
        assert.strictEqual(service.get('user.id'), user.get('id'));
      });
  });

  skip('No auth user exists', function (assert) {});
});
