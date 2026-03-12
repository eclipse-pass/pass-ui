import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/grants', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/grants');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants');
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: string) {
      assert.strictEqual(route, 'submissions.new.basics');
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants');
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: string) {
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
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = () => {};

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
