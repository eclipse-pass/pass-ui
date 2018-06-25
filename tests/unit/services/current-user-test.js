import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-user', (hooks) => {
  setupTest(hooks);

  // const mockStore = {
  //   moo: 'Moo',
  //   findAll() {
  //     return Ember.A(Ember.Object.create({
  //       username: 'hvu',
  //       email: 'hvu@example.com'
  //     }));
  //   }
  // };

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:current-user');
    assert.ok(service);
  });

  // test('loading authenticated user returns user data', function (assert) {
  //   const service = this.owner.factoryFor('service:current-user')
  //     .create({
  //       store: mockStore,
  //       session: { isAuthenticated: true }
  //     });
  //   service.load().then(user => console.log(user));
  //   assert.ok(true);
  // });
});
