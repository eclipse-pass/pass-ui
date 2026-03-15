/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';
import type SubmissionsNewFiles from 'pass-ui/controllers/submissions/new/files';
import type AppStore from 'pass-ui/services/store';

module('Unit | Controller | submissions/new/files', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files') as SubmissionsNewFiles;
    assert.ok(controller);
  });

  test('No manuscript files, user is submitter, stops transition', async function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files') as SubmissionsNewFiles;
    let loadTabAccessed = false;
    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => true,
      }),
    );
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getFiles() {
          return [];
        },
        getMaxStep() {
          return 6;
        },
      }),
    );
    const model = { files: [] };
    controller.model = model as unknown as typeof controller.model;
    controller.loadingNext = true;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((_name: string) => {
      loadTabAccessed = true;
    }) as typeof routerService.transitionTo;
    assert.strictEqual(controller.workflow.getFiles().length, 0);
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ dismiss: Swal.DismissReason.cancel });
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
    swalStub.restore();
  });

  test('No manuscript files, user not submitter, warns before transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files') as SubmissionsNewFiles;
    let loadTabAccessed = false;
    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => false,
      }),
    );
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getFiles() {
          return [];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    const model = { files: [] };
    controller.model = model as unknown as typeof controller.model;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((_name: string) => {
      loadTabAccessed = true;
    }) as typeof routerService.transitionTo;
    assert.strictEqual(controller.workflow.getFiles().length, 0);
    // override swal so it doesn't pop up
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ dismiss: Swal.DismissReason.cancel });
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
    swalStub.restore();
  });

  test('Multiple manuscript files stops transition', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files') as SubmissionsNewFiles;

    let loadTabAccessed = false;

    const submission = { id: 'sub:1' };
    const file1 = {
      fileRole: 'manuscript',
      submission,
    };
    const file2 = {
      fileRole: 'manuscript',
      submission,
    };

    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => false,
      }),
    );
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getFiles() {
          return [file1, file2];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    const model = { newSubmission: submission };
    controller.model = model as unknown as typeof controller.model;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (() => {
      loadTabAccessed = true;
    }) as typeof routerService.transitionTo;
    assert.strictEqual(controller.workflow.getFiles().length, 2);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
  });

  test('Valid files page does transition', async function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files') as SubmissionsNewFiles;

    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => false,
      }),
    );
    let subSaved = false;
    const submission = {};
    const file = {
      fileRole: 'manuscript',
      submission,
    };
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getFiles() {
          return [file];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    const model = {
      newSubmission: submission,
    };
    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = ((record: unknown) => {
      if (record === submission) {
        subSaved = true;
      }
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (() => {}) as typeof routerService.transitionTo;

    await controller.validateAndLoadTab('submissions.new.basics');

    assert.ok(subSaved, 'Submission was not saved');
    assert.strictEqual(controller.workflow.getFiles().length, 1);
  });
});
