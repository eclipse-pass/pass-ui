import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:submissions/index', 'Unit | Controller | submissions/index', {
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
    roles: ['admin']
  }));
  assert.equal(controller.get('adminColumns'), controller.get('columns'));
});

test('properly returns submitter roles', function (assert) {
  let controller = this.subject();
  controller.set('currentUser.user', Ember.Object.create({
    roles: ['submitter']
  }));
  assert.equal(controller.get('piColumns'), controller.get('columns'));
});
