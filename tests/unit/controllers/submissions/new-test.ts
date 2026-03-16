/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNewController from 'pass-ui/controllers/submissions/new';

interface MockSubmission {
  id?: string;
  submitted?: boolean;
  submissionStatus?: string;
  submitter?: { id: string };
  submitterName?: string;
  submitterEmail?: string;
  metadata?: string;
  repositories?: { id: string; integrationType: string }[];
  [key: string]: unknown;
}

module('Unit | Controller | submissions/new', (hooks) => {
  setupTest(hooks);

  let controller: SubmissionsNewController;
  let submissionHandler: SubmissionHandlerService;
  let workflowService: Workflow;
  let submissionEvent: Record<string, unknown>;
  let submissionSaved = false;
  let submissionEventSaved = false;
  let publicationSaved = false;

  let submission: MockSubmission;
  let publication: { id: string };
  let model: { newSubmission: MockSubmission; publication: { id: string } };
  let comment: string;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:submissions/new') as SubmissionsNewController;
    submissionHandler = this.owner.lookup('service:submission-handler') as SubmissionHandlerService;
    workflowService = this.owner.lookup('service:workflow') as Workflow;
    submissionSaved = false;
    submissionEventSaved = false;
    publicationSaved = false;
    submissionEvent = {};
    submissionHandler.store = {
      createRecord() {
        return submissionEvent;
      },
      persistRecord(record: Record<string, unknown>) {
        if (record === submissionEvent) submissionEventSaved = true;
        else if (record?.id === 'pub:0') publicationSaved = true;
        else submissionSaved = true;
        return Promise.resolve({ content: {} }) as ReturnType<typeof submissionHandler.store.persistRecord>;
      },
    } as unknown as typeof submissionHandler.store;
    publication = {
      id: 'pub:0',
    };
    comment = 'moo';
  });

  const setUpSubmissionModel = (submissionArg: MockSubmission) => {
    submission = {
      ...submissionArg,
    };
    model = {
      newSubmission: submission,
      publication,
    };
    const file = {
      fileRole: 'manuscript',
      submission,
    };
    workflowService.setFiles([file] as never);
  };

  // Replace this with your real tests.
  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('finish and save non-proxy submission', async function (assert) {
    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'submitter:test-id' },
      }),
    );
    const repository1 = {
      id: 'test:repo1',
      integrationType: 'full',
      name: 'moo',
      agreementText: 'Milk cows',
      _isWebLink: false,
    };
    const repository2 = {
      id: 'test:repo2',
      integrationType: 'web-link',
      _isWebLink: true,
    };

    const submissionBase = {
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repository1, repository2]),
    };
    setUpSubmissionModel(submissionBase);

    assert.expect(16);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((name: string) => {
      assert.strictEqual(name, 'thanks');

      assert.true(publicationSaved);
      assert.true(submissionSaved);
      assert.true(submissionEventSaved);

      assert.true(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'submitted');

      // check web-linked repo is NOT removed
      assert.strictEqual(submission.repositories!.length, 2);
      assert.strictEqual(submission.repositories![0]!.id, 'test:repo1');

      assert.strictEqual((submissionEvent.submission as MockSubmission).submitter!.id, 'submitter:test-id');
      assert.strictEqual((submissionEvent.performedBy as { id: string }).id, 'submitter:test-id');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.eventType, 'submitted');

      const md = JSON.parse(submission.metadata!);
      assert.ok(md.agreements);
      assert.strictEqual(md.agreements.length, 1);
      assert.deepEqual(md.agreements[0], {
        moo: 'Milk cows',
      });
    }) as typeof routerService.transitionTo;

    controller.model = model as unknown as typeof controller.model;
    controller.comment = comment;

    controller.send('submit');
  });

  test('finish and save proxy submission', async function (assert) {
    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'submitter:test-proxy-id' },
      }),
    );
    const repository = { id: 'test:repo1', integrationType: 'full' };

    const submissionBase = {
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A([repository]),
    };
    setUpSubmissionModel(submissionBase);

    assert.expect(11);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((name: string) => {
      assert.strictEqual(name, 'thanks');

      assert.true(publicationSaved);
      assert.true(submissionSaved);
      assert.true(submissionEventSaved);

      assert.strictEqual(submission.submissionStatus, 'approval-requested');
      assert.strictEqual(submission.repositories!.length, 1);
      assert.strictEqual((submissionEvent.submission as MockSubmission).submitter!.id, 'submitter:test-id');
      assert.strictEqual((submissionEvent.performedBy as { id: string }).id, 'submitter:test-proxy-id');
      assert.strictEqual(submissionEvent.performerRole, 'preparer');
      assert.strictEqual(submissionEvent.eventType, 'approval-requested');
      assert.strictEqual(submissionEvent.comment, comment);
    }) as typeof routerService.transitionTo;

    controller.model = model as unknown as typeof controller.model;
    controller.comment = comment;

    controller.send('submit');
  });

  test('finish and save proxy submission with new user', async function (assert) {
    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'submitter:test-proxy-id' },
      }),
    );
    const repository = { id: 'test:repo1', integrationType: 'full' };

    const submissionBase = {
      id: 'sub:0',
      submitterName: 'test name',
      submitterEmail: 'mailto:test@email.com',
      repositories: A([repository]),
    };
    setUpSubmissionModel(submissionBase);

    assert.expect(13);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((name: string) => {
      assert.strictEqual(name, 'thanks');

      assert.true(publicationSaved);
      assert.true(submissionSaved);
      assert.true(submissionEventSaved);

      assert.strictEqual(submission.submitter, undefined);
      assert.strictEqual(submission.submitterName, 'test name');
      assert.strictEqual(submission.submitterEmail, 'mailto:test@email.com');
      assert.strictEqual(submission.submissionStatus, 'approval-requested');
      assert.strictEqual(submission.repositories!.length, 1);
      assert.strictEqual((submissionEvent.performedBy as { id: string }).id, 'submitter:test-proxy-id');
      assert.strictEqual(submissionEvent.performerRole, 'preparer');
      assert.strictEqual(submissionEvent.eventType, 'approval-requested-newuser');
      assert.strictEqual(submissionEvent.comment, comment);
    }) as typeof routerService.transitionTo;

    controller.model = model as unknown as typeof controller.model;
    controller.comment = comment;

    controller.send('submit');
  });

  /**
   * Three things are mocked, each of which run an assertion (that always passes). This
   * test passes when exactly 3 assertions are run, and the controller tries to transition
   * to the expected route.
   *
   * This action should first create a SweetAlert (swal), then call 'deleteSubmission' in the
   * submission handler, finally call 'transitionTo' to transition to the 'submissions'
   * route.
   */
  test('abort should delete submission and transition', async function (assert) {
    assert.expect(3);

    const submission = {
      id: 'sub:0',
      isDraft: true,
    };

    const model = {
      newSubmission: submission,
    };

    controller.model = model as unknown as typeof controller.model;

    // Mock global 'swal' for this test
    const swalStub = Sinon.stub(Swal, 'fire').callsFake(() => {
      assert.ok(true);
      return Promise.resolve({
        value: 'moo',
      });
    });

    // Having this mocked function run shows that the service will delete the submission
    controller.submissionHandler = {
      deleteSubmission(sub: unknown) {
        assert.ok(sub);
        return Promise.resolve();
      },
    } as unknown as typeof controller.submissionHandler;
    controller.router = {
      transitionTo: (name: string) => {
        assert.strictEqual(name, 'submissions', 'unexpected transition was named');
      },
    } as typeof controller.router;

    controller.send('abort');
    swalStub.restore();
  });

  test('abort should not delete submission if submission.id is undefined', async function (assert) {
    assert.expect(3);

    const submission = {
      id: undefined,
    };

    const model = {
      newSubmission: submission,
    };

    controller.model = model as unknown as typeof controller.model;

    // Mock global 'swal' for this test
    const swalStub = Sinon.stub(Swal, 'fire').callsFake(() => {
      assert.ok(true);
      return Promise.resolve({
        value: 'moo',
      });
    });

    let deleteSubmissionCalled = false;

    // Having this mocked function run shows that the service will delete the submission
    controller.submissionHandler = {
      deleteSubmission(_sub: unknown) {
        deleteSubmissionCalled = true;
        return Promise.resolve();
      },
    } as unknown as typeof controller.submissionHandler;
    controller.router = {
      transitionTo: (name: string) => {
        assert.false(deleteSubmissionCalled);
        assert.strictEqual(name, 'submissions', 'unexpected transition was named');
      },
    } as typeof controller.router;

    controller.send('abort');
    swalStub.restore();
  });
});
