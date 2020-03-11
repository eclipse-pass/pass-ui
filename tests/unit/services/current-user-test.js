import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-user', (hooks) => {
  setupTest(hooks);

  test('load without userToken', function (assert) {
    const service = this.owner.lookup('service:current-user');
    assert.ok(service);

    let user = EmberObject.create({
      id: 0,
      username: 'hvu',
      email: 'hvu@example.com'
    });

    let result = {
      '@id': user.get('id')
    };

    service.set('ajax', EmberObject.create({
      request(url, method, options) {
        assert.ok(true);
        assert.equal(url.includes('userToken'), false);

        return new Promise(resolve => resolve(result));
      }
    }));

    service.set('store', EmberObject.create({
      findRecord(type, id) {
        assert.ok(true);
        assert.equal(type, 'user');
        assert.equal(id, user.get('id'));

        return new Promise(resolve => resolve(user));
      }
    }));

    assert.expect(7);

    return service.get('load').perform().then(() => {
      assert.equal(service.get('user.id'), user.get('id'));
    });
  });

  test('load with userToken', function (assert) {
    const service = this.owner.lookup('service:current-user');
    assert.ok(service);

    let userToken = 'blah';

    let user = EmberObject.create({
      id: 0,
      username: 'hvu',
      email: 'hvu@example.com'
    });

    let result = {
      '@id': user.get('id')
    };

    service.set('ajax', EmberObject.create({
      request(url, method, options) {
        assert.ok(true);
        assert.equal(url.includes(userToken), true);

        return new Promise(resolve => resolve(result));
      }
    }));

    service.set('store', EmberObject.create({
      findRecord(type, id) {
        assert.ok(true);
        assert.equal(type, 'user');
        assert.equal(id, user.get('id'));

        return new Promise(resolve => resolve(user));
      }
    }));

    assert.expect(7);

    return service.get('load').perform(userToken).then(() => {
      assert.equal(service.get('user.id'), user.get('id'));
    });
  });
});
