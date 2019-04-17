import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/detail', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller);
  });

  test('delete action should trigger destroy on model object', function (assert) {
    assert.expect(2);

    // Mock the global SweetAlert object to always return immediately
    swal = () => Promise.resolve({
      value: 'moo'
    });

    const submission = {
      get() {
        return undefined;
      },
      destroyRecord() {
        assert.ok(true);
        return Promise.resolve();
      }
    };

    const controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller, 'controller not found');

    controller.send('deleteSubmission', submission);
  });
});
