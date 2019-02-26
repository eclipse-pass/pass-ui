import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/grants', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/grants');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/grants');
    let loadTabAccessed = false;
    controller.transitionToRoute = function (route) {
      loadTabAccessed = true;
      assert.equal('submissions.new.basics', route);
    };
    controller.send('loadPrevious');
    assert.equal(loadTabAccessed, true);
  });

  test('loadNext triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/grants');
    let loadTabAccessed = false;
    controller.transitionToRoute = function (route) {
      loadTabAccessed = true;
      assert.equal('submissions.new.policies', route);
    };
    controller.send('loadNext');
    assert.equal(loadTabAccessed, true);
  });
});
