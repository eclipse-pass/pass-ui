/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/policies', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/policies');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    assert.expect(2);

    const controller: any = this.owner.lookup('controller:submissions/new/policies');
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store: any = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: any) {
      assert.strictEqual(route, 'submissions.new.grants');
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    const controller: any = this.owner.lookup('controller:submissions/new/policies');
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store: any = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: any) {
      assert.strictEqual(route, 'submissions.new.repositories');
    };
    controller.send('loadNext');
  });

  test('navigating to other workflow steps should save the submission', function (assert) {
    assert.expect(4);

    const controller: any = this.owner.lookup('controller:submissions/new/policies');
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store: any = this.owner.lookup('service:store');
    store.persistRecord = () => {
      assert.ok(true);
      return Promise.resolve({ content: {} });
    };

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: any) {
      assert.ok(route === 'submissions.new.repositories' || route === 'submissions.new.grants');
    };

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
