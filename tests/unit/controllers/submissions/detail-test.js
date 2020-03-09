import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/detail', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller);
  });

  test('delete action should call the submission handler', function (assert) {
    assert.expect(3);

    // Mock the global SweetAlert object to always return immediately
    swal = () => Promise.resolve({
      value: 'moo'
    });

    const submission = EmberObject.create();

    const controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller, 'controller not found');

    controller.set('submissionHandler', EmberObject.create({
      deleteSubmission() {
        assert.ok(true);
        return Promise.resolve();
      }
    }));
    controller.set('transitionToRoute', () => assert.ok(true));

    controller.send('deleteSubmission', submission);
  });
});
