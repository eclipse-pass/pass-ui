import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type Store from '@ember-data/store';
import type UserModel from 'pass-ui/models/user';

module('Unit | Model | user', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const user = run(() => (this.owner.lookup('service:store') as Store).createRecord('user', {})) as UserModel;
    assert.ok(user);

    return run(() => {
      assert.false(user.get('isAdmin'));
      assert.false(user.get('isSubmitter'));

      user.set('roles', ['admin']);
      assert.true(user.get('isAdmin'));

      user.get('roles').push('submitter');
      assert.true(user.get('isSubmitter'));
      assert.true(user.get('isAdmin'));
    });
  });
});
