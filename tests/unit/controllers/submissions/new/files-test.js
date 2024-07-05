/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/files', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
    assert.ok(controller);
  });

  test('No manuscript files, user is submitter, stops transition', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
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
        getFilesTemp() {
          return [];
        },
        getMaxStep() {
          return 6;
        },
      }),
    );
    let model = { files: [] };
    controller.set('model', model);
    controller.set('loadingNext', true);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (name) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.get('workflow').getFilesTemp().length, 0);
    swal = (result) => new Promise((resolve) => assert.ok(true));
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
  });

  test('No manuscript files, user not submitter, warns before transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
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
        getFilesTemp() {
          return [];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    let model = { files: [] };
    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (name) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.get('workflow').getFilesTemp().length, 0);
    // override swal so it doesn't pop up
    swal = (result) => new Promise((resolve) => assert.ok(true));
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
  });

  test('Multiple manuscript files stops transition', function (assert) {
    const storeService = this.owner.lookup('service:store');

    const submission = storeService.createRecord('submission', {
      save: () => {
        return Promise.resolve();
      },
    });
    let controller = this.owner.lookup('controller:submissions/new/files');

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
        getFilesTemp() {
          return [file];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );
    let files = [file];
    let model = { files, newSubmission: submission };
    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (name) => {
      loadTabAccessed = true;
    };
    assert.strictEqual(controller.get('workflow').getFilesTemp().length, 1);
    assert.strictEqual(controller.get('model.files').length, 1);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.false(loadTabAccessed);
  });

  test('Valid files page does transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');

    this.owner.register(
      'controller:submissions.new',
      EmberObject.extend({
        userIsSubmitter: () => false,
      }),
    );
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getFilesTemp() {
          return [];
        },
        getMaxStep() {
          return 7;
        },
      }),
    );

    let subSaved = false;

    const submission = EmberObject.create({
      save: () => {
        subSaved = true;
        return Promise.resolve();
      },
    });

    const file = EmberObject.create({
      fileRole: 'manuscript',
      submission,
      save: () => {
        return Promise.resolve();
      },
    });

    let model = {
      newSubmission: submission,
      files: [file],
    };
    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = () => {
      assert.ok(subSaved, 'Submission was not saved');
      assert.strictEqual(controller.get('workflow').getFilesTemp().length, 0);
      assert.strictEqual(controller.get('model.files').length, 1);
    };

    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });
});
