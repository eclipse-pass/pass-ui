import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type SubmissionsNewGrants from 'pass-ui/controllers/submissions/new/grants';
import type AppStore from 'pass-ui/services/store';

module('Unit | Controller | submissions/new/grants', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/grants') as SubmissionsNewGrants;
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants') as SubmissionsNewGrants;
    const model = {
      newSubmission: {},
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      assert.ok(true);
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      assert.strictEqual(route, 'submissions.new.basics');
    }) as typeof routerService.transitionTo;
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants') as SubmissionsNewGrants;
    const model = {
      newSubmission: {},
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      assert.ok(true);
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      assert.strictEqual(route, 'submissions.new.policies');
    }) as typeof routerService.transitionTo;
    controller.send('loadNext');
  });

  /**
   * Assertions are called only when the mock submission object is saved. This should happen
   * once for each action sent to the controller.
   */
  test('transitions to other workflow steps saves the in progress submission', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/grants') as SubmissionsNewGrants;
    const model = {
      newSubmission: {},
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      assert.ok(true);
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (() => undefined) as unknown as typeof routerService.transitionTo;

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
