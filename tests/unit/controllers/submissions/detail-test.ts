import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';
import Swal from 'pass-ui/util/swal';
import { waitFor } from '@ember/test-helpers';
import type RepositoryModel from 'pass-ui/models/repository';
import type SubmissionModel from 'pass-ui/models/submission';
import type SubmissionsDetailController from 'pass-ui/controllers/submissions/detail';

// Close any SweetAlert popup now: with the hide animation off, close() removes it right away
// instead of after the animation, so a popup can't outlive its test.
function closeSwal(): void {
  document.querySelectorAll<HTMLElement>('.swal2-popup').forEach((popup) => {
    popup.style.animation = 'none';
    popup.style.transition = 'none';
  });
  Swal.close();
}

module('Unit | Controller | submissions/detail', (hooks) => {
  setupTest(hooks);

  hooks.afterEach(function () {
    closeSwal();
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/detail');
    assert.ok(controller);
  });

  test('delete action should call the submission handler', function (assert) {
    assert.expect(2);

    // Mock the global SweetAlert object to always return immediately
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ value: true });

    const submission = {} as unknown as SubmissionModel;

    const controller = this.owner.lookup('controller:submissions/detail') as SubmissionsDetailController;
    assert.ok(controller, 'controller not found');

    controller.submissionHandler = {
      deleteSubmission() {
        assert.ok(true);
        return Promise.resolve();
      },
    } as unknown as typeof controller.submissionHandler;

    controller.send('deleteSubmission', submission);
    swalStub.restore();
  });

  test('error message shown on submission deletion error', async function (assert) {
    const submission = {} as unknown as SubmissionModel;

    // Mock global SweetAlert. Mocks a user clicking OK on the popup
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ value: true });

    const controller = this.owner.lookup('controller:submissions/detail') as SubmissionsDetailController;
    const routerService = this.owner.lookup('service:router');
    const transitionFake = Sinon.replace(routerService, 'transitionTo', Sinon.fake());

    controller.submissionHandler = this.owner.lookup(
      'service:submission-handler',
    ) as typeof controller.submissionHandler;
    const deleteFake = Sinon.replace(controller.submissionHandler, 'deleteSubmission', Sinon.fake.rejects());

    controller.flashMessages = this.owner.lookup('service:flash-messages') as typeof controller.flashMessages;
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

  test('deposit agreement is a named, keyboard-focusable region in the approval dialog', async function (assert) {
    // The agreement steps are private helpers of approveChanges
    const controller = this.owner.lookup('controller:submissions/detail') as unknown as {
      _categorizeRepositories(repos: RepositoryModel[]): {
        withAgreement: { id: string; title: string; html: string }[];
      };
      _collectAgreements(repos: { id: string; title: string; html: string }[]): Promise<{ cancelled: boolean }>;
    };
    const repo = { name: 'JScholarship', agreementText: 'NON-EXCLUSIVE LICENSE', _isWebLink: false } as RepositoryModel;
    const { withAgreement } = controller._categorizeRepositories([repo]);

    const collected = controller._collectAgreements(withAgreement);
    await waitFor('.swal2-popup [data-test-deposit-agreement]');

    const region = '.swal2-popup[role="dialog"] .swal2-html-container [data-test-deposit-agreement]';
    assert.dom(region, document.body).exists('agreement is inside the dialog');
    assert.dom(region, document.body).hasAttribute('role', 'region');
    assert.dom(region, document.body).hasAttribute('tabindex', '0');
    assert.dom(region, document.body).hasAttribute('aria-label', 'Deposit agreement for JScholarship');
    assert.dom(region, document.body).hasText('NON-EXCLUSIVE LICENSE');
    assert.dom('.swal2-popup textarea[disabled]', document.body).doesNotExist('no disabled textarea');

    closeSwal();
    assert.true((await collected).cancelled);
  });
});
