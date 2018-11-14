import { moduleFor, test } from 'ember-qunit';
import User from 'pass-ember/models/user';

moduleFor('controller:grants/index', 'Unit | Controller | grants/index', {
  // Specify the other units that are required for this test.
  needs: ['service:currentUser', 'service:ajax']
});

// Replace this with your real tests.
test('it exists', function (assert) {
  let controller = this.subject();
  assert.ok(controller);
});

test('properly returns admin roles', function (assert) {
  let controller = this.subject();
  controller.set('currentUser.user', Ember.Object.create({
    isAdmin: true
  }));

  assert.equal(controller.get('adminColumns'), controller.get('columns'));
});

test('properly returns submitter roles', function (assert) {
  let controller = this.subject();
  controller.set('currentUser.user', Ember.Object.create({
    isSubmitter: true
  }));

  assert.equal(controller.get('piColumns'), controller.get('columns'));
});
