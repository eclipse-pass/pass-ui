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

  test('No manuscript files, user is submitter, stops transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
    let loadTabAccessed = false;
    this.owner.register('controller:submissions.new', EmberObject.extend({
      userIsSubmitter: true
    }));
    this.owner.register('service:workflow', EmberObject.extend({
      getFilesTemp() { return []; },
      getMaxStep() { return 6; }
    }));
    let model = { files: [] };
    controller.set('model', model);
    controller.set('loadingNext', true);
    controller.transitionToRoute = function () {
      loadTabAccessed = true;
    };
    assert.equal(controller.get('workflow').getFilesTemp().length, 0);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.equal(loadTabAccessed, false);
  });

  test('No manuscript files, user not submitter, warns before transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
    let loadTabAccessed = false;
    this.owner.register('controller:submissions.new', EmberObject.extend({
      userIsSubmitter: false
    }));
    this.owner.register('service:workflow', EmberObject.extend({
      getFilesTemp() { return []; },
      getMaxStep() { return 7; }
    }));
    let model = { files: [] };
    controller.set('model', model);
    controller.transitionToRoute = function () {
      loadTabAccessed = true;
    };
    assert.equal(controller.get('workflow').getFilesTemp().length, 0);
    // override swal so it doesn't pop up
    swal = result => new Promise(resolve => (assert.ok(true)));
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.equal(loadTabAccessed, false);
  });

  test('Multiple manuscript files stops transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');
    let loadTabAccessed = false;
    let file = EmberObject.create({
      fileRole: 'manuscript'
    });
    this.owner.register('controller:submissions.new', EmberObject.extend({
      userIsSubmitter: false
    }));
    this.owner.register('service:workflow', EmberObject.extend({
      getFilesTemp() {
        return [file];
      },
      getMaxStep() { return 7; }
    }));
    let files = [file];
    let model = { files };
    controller.set('model', model);
    controller.transitionToRoute = function () {
      loadTabAccessed = true;
    };
    assert.equal(controller.get('workflow').getFilesTemp().length, 1);
    assert.equal(controller.get('model.files').length, 1);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
    assert.equal(loadTabAccessed, false);
  });

  test('Valid files page does transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/files');

    this.owner.register('controller:submissions.new', EmberObject.extend({
      userIsSubmitter: false
    }));
    this.owner.register('service:workflow', EmberObject.extend({
      getFilesTemp() {
        return [];
      },
      getMaxStep() { return 7; }
    }));

    let subSaved = false;

    let file = EmberObject.create({
      fileRole: 'manuscript'
    });

    let model = {
      files: [file],
      newSubmission: EmberObject.create({
        save: () => {
          subSaved = true;
          return Promise.resolve();
        }
      })
    };
    controller.set('model', model);
    controller.transitionToRoute = function () {
      assert.ok(subSaved, 'Submission was not saved');
      assert.equal(controller.get('workflow').getFilesTemp().length, 0);
      assert.equal(controller.get('model.files').length, 1);
    };

    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });
});
