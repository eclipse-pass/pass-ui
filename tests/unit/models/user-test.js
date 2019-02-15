import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const user = run(() => this.owner.lookup('service:store').createRecord('user'));
    assert.ok(user);

    return run(() => {
      assert.equal(user.get('isAdmin'), false);
      assert.equal(user.get('isSubmitter'), false);

      user.set('roles', ['admin']);
      assert.equal(user.get('isAdmin'), true);

      user.get('roles').push('submitter');
      assert.equal(user.get('isSubmitter'), true);
      assert.equal(user.get('isAdmin'), true);
    });
  });
});
