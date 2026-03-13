/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import type SubmissionsNewReview from 'pass-ui/controllers/submissions/new/review';

module('Unit | Controller | submissions/new/review', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review') as SubmissionsNewReview;
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review') as SubmissionsNewReview;
    const model = {
      newSubmission: {
        save: () => Promise.resolve(assert.ok(true)),
      },
    };

    controller.model = model as unknown as typeof controller.model;

    let loadTabAccessed = false;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      loadTabAccessed = true;
      assert.strictEqual(route, 'submissions.new.files');
    }) as typeof routerService.transitionTo;
    controller.send('loadPrevious');
    assert.true(loadTabAccessed);
  });

  test('parent properties are retrieved', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/review') as SubmissionsNewReview;
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

    assert.ok(controller.uploading);
    assert.strictEqual(controller.waitingMessage, 'test waiting message');
    assert.strictEqual(controller.comment, 'test comment');
    controller.comment = 'comment changed';
    assert.strictEqual(controller.comment, 'comment changed');
  });
});
