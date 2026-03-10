/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';

module('Unit | Controller | submissions/new/files', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/files');
    assert.ok(controller);
  });

  test('No manuscript files, user is submitter, stops transition', async function (assert) {
    const controller: any = this.owner.lookup('controller:submissions/new/files');
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
    controller.model = model;
    controller.loadingNext = true;
    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = (name: any) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.workflow.getFiles().length, 0);
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ dismiss: Swal.DismissReason.cancel });
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
    swalStub.restore();
  });

  test('No manuscript files, user not submitter, warns before transition', function (assert) {
    const controller: any = this.owner.lookup('controller:submissions/new/files');
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
    controller.model = model;
    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = (name: any) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.workflow.getFiles().length, 0);
    // override swal so it doesn't pop up
    const swalStub = Sinon.stub(Swal, 'fire').resolves({ dismiss: Swal.DismissReason.cancel });
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
    swalStub.restore();
  });

  test('Multiple manuscript files stops transition', function (assert) {
    const storeService: any = this.owner.lookup('service:store');

    const submission = storeService.createRecord('submission', {
      save: () => {
        return Promise.resolve();
      },
    });
    const controller: any = this.owner.lookup('controller:submissions/new/files');

    let loadTabAccessed = false;

    const file = storeService.createRecord('file', {
      fileRole: 'manuscript',
      submission,
      save: () => {
        return Promise.resolve();
      },
    });

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
          return [file];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    const files = [file];
    const model = { files, newSubmission: submission };
    controller.model = model;
    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = (name: any) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.workflow.getFiles().length, 1);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
  });

  test('Valid files page does transition', function (assert) {
    const controller: any = this.owner.lookup('controller:submissions/new/files');

    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => false,
      }),
    );
    let subSaved = false;
    const submission = {
      save: () => {
        subSaved = true;
        return Promise.resolve();
      },
    };
    const file = {
      fileRole: 'manuscript',
      submission,
      save: () => {
        return Promise.resolve();
      },
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
    controller.model = model;

    const routerService: any = this.owner.lookup('service:router');
    routerService.transitionTo = () => {
      assert.ok(subSaved, 'Submission was not saved');
      assert.strictEqual(controller.workflow.getFiles().length, 1);
    };

    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });
});
