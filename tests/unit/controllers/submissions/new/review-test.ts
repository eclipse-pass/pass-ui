/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Controller | submissions/new/review', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review');
    const model = {
      newSubmission: {
        save: () => Promise.resolve(assert.ok(true)),
      },
    };

    controller.model = model;

    let loadTabAccessed = false;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = function (route: string) {
      loadTabAccessed = true;
      assert.strictEqual(route, 'submissions.new.files');
    };
    controller.send('loadPrevious');
    assert.true(loadTabAccessed);
  });

  test('parent properties are retrieved', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review');
    run(() => {
      this.owner.register(
        'controller:submissions/new',
        EmberObject.extend({
          uploading: 'is uploading',
          comment: 'test comment',
          waitingMessage: 'test waiting message',
        }),
      );
    });

    assert.strictEqual(controller.uploading, 'is uploading');
    assert.strictEqual(controller.waitingMessage, 'test waiting message');
    assert.strictEqual(controller.comment, 'test comment');
    controller.comment = 'comment changed';
    assert.strictEqual(controller.comment, 'comment changed');
  });
});
