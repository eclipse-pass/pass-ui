import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/policies', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/policies');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/policies');
    let loadTabAccessed = false;
    controller.transitionToRoute = function (route) {
      loadTabAccessed = true;
      assert.equal('submissions.new.grants', route);
    };
    controller.send('loadPrevious');
    assert.equal(loadTabAccessed, true);
  });

  test('loadNext triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/policies');
    let loadTabAccessed = false;
    controller.transitionToRoute = function (route) {
      loadTabAccessed = true;
      assert.equal('submissions.new.repositories', route);
    };
    controller.send('loadNext');
    assert.equal(loadTabAccessed, true);
  });
});
