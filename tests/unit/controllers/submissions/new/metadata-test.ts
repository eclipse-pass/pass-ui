import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type SubmissionsNewMetadata from 'pass-ui/controllers/submissions/new/metadata';
import type AppStore from 'pass-ui/services/store';

module('Unit | Controller | submissions/new/metadata', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/metadata') as SubmissionsNewMetadata;
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/metadata') as SubmissionsNewMetadata;

    let subSaved = false;

    const model = {
      newSubmission: {},
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      subSaved = true;
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      assert.ok(subSaved, 'submission was not saved');
      assert.strictEqual(route, 'submissions.new.repositories');
    }) as typeof routerService.transitionTo;
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/metadata') as SubmissionsNewMetadata;

    let subSaved = false;
    const model = {
      newSubmission: {},
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      subSaved = true;
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      assert.ok(subSaved, 'submission was not saved');
      assert.strictEqual(route, 'submissions.new.files');
    }) as typeof routerService.transitionTo;
    controller.send('loadNext');
  });
});
