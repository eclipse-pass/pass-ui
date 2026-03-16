import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type SubmissionsNewPolicies from 'pass-ui/controllers/submissions/new/policies';
import type AppStore from 'pass-ui/services/store';

module('Unit | Controller | submissions/new/policies', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/policies') as SubmissionsNewPolicies;
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/policies') as SubmissionsNewPolicies;
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
      assert.strictEqual(route, 'submissions.new.grants');
    }) as typeof routerService.transitionTo;
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/policies') as SubmissionsNewPolicies;
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
      assert.strictEqual(route, 'submissions.new.repositories');
    }) as typeof routerService.transitionTo;
    controller.send('loadNext');
  });

  test('navigating to other workflow steps should save the submission', function (assert) {
    assert.expect(4);

    const controller = this.owner.lookup('controller:submissions/new/policies') as SubmissionsNewPolicies;
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
      assert.ok(route === 'submissions.new.repositories' || route === 'submissions.new.grants');
    }) as typeof routerService.transitionTo;

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
