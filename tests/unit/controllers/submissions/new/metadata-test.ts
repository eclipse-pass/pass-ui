/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/metadata', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/metadata');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    const controller: any = this.owner.lookup('controller:submissions/new/metadata');

    let subSaved = false;

    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store: any = this.owner.lookup('service:store');
    store.persistRecord = () => {
      subSaved = true;
      return Promise.resolve({ content: {} });
    };

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: any) {
      assert.ok(subSaved, 'submission was not saved');
      assert.strictEqual(route, 'submissions.new.repositories');
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    const controller: any = this.owner.lookup('controller:submissions/new/metadata');

    let subSaved = false;
    const model = {
      newSubmission: {},
    };

    controller.model = model;

    const store: any = this.owner.lookup('service:store');
    store.persistRecord = () => {
      subSaved = true;
      return Promise.resolve({ content: {} });
    };

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: any) {
      assert.ok(subSaved, 'submission was not saved');
      assert.strictEqual(route, 'submissions.new.files');
    };
    controller.send('loadNext');
  });
});
