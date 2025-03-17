import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Sinon from 'sinon';
import Swal from 'sweetalert2/dist/sweetalert2.js';

module('Unit | Controller | submissions/detail', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller);
  });

  test('delete action should call the submission handler', function (assert) {
    assert.expect(2);

    // Mock the global SweetAlert object to always return immediately
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ value: true });

    const submission = EmberObject.create();

    const controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller, 'controller not found');

    controller.set(
      'submissionHandler',
      EmberObject.create({
        deleteSubmission() {
          assert.ok(true);
          return Promise.resolve();
        },
      }),
    );

    controller.send('deleteSubmission', submission);
    swalStub.restore();
  });

  test('error message shown on submission deletion error', async function (assert) {
    const submission = {};

    // Mock global SweetAlert. Mocks a user clicking OK on the popup
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ value: true });

    const controller = this.owner.lookup('controller:submissions/detail');
    const routerService = this.owner.lookup('service:router');
    const transitionFake = Sinon.replace(routerService, 'transitionTo', Sinon.fake());

    controller.submissionHandler = this.owner.lookup('service:submission-handler');
    const deleteFake = Sinon.replace(controller.submissionHandler, 'deleteSubmission', Sinon.fake.rejects());

    controller.flashMessages = this.owner.lookup('service:flash-messages');
    const flashFake = Sinon.replace(controller.flashMessages, 'danger', Sinon.fake());

    // Note: using controller.send resolves immediately
    // making subsequent assertions evaluate before the controller action fires
    // Can't really use Sinon in a nice way unless we call the controller
    // method directly
    await controller.deleteSubmission(submission);

    assert.ok(deleteFake.calledOnce, 'Submission handler delete should be called');
    assert.ok(flashFake.calledOnce, 'Flash message should be called');
    assert.equal(transitionFake.callCount, 0, 'Transition should not be called');
    swalStub.restore();
  });
});
