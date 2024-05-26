import EmberObject from '@ember/object';
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
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/policies');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route) {
      assert.strictEqual(route, 'submissions.new.grants');
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/policies');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route) {
      assert.strictEqual(route, 'submissions.new.repositories');
    };
    controller.send('loadNext');
  });

  test('navigating to other workflow steps should save the submission', function (assert) {
    assert.expect(4);

    const controller = this.owner.lookup('controller:submissions/new/policies');
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true)),
      }),
    });

    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route) {
      assert.ok(route === 'submissions.new.repositories' || route === 'submissions.new.grants');
    };

    controller.send('loadNext');
    controller.send('loadPrevious');
  });
});
