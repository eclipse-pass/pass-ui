import EmberObject from '@ember/object';
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
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route) {
      assert.strictEqual(route, 'submissions.new.basics');
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    let controller = this.owner.lookup('controller:submissions/new/grants');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route) {
      assert.strictEqual(route, 'submissions.new.policies');
    };
    controller.send('loadNext');
  });

  /**
   * Assertions are called only when the mock submission object is saved. This should happen
   * once for each action sent to the controller.
   */
  test('transitions to other workflow steps saves the in progress submission', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = () => {};

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
