import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/metadata', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/metadata');
    assert.ok(controller);
  });

  test('loadPrevious triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/metadata');

    let subSaved = false;

    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => {
          subSaved = true;
          return Promise.resolve();
        }
      })
    });

    controller.set('model', model);
    controller.transitionToRoute = function (route) {
      assert.ok(subSaved, 'submission was not saved');
      assert.equal('submissions.new.repositories', route);
    };
    controller.send('loadPrevious');
  });

  test('loadNext triggers transition', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/metadata');

    let subSaved = false;
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        save: () => {
          subSaved = true;
          return Promise.resolve();
        }
      })
    });

    controller.set('model', model);
    controller.transitionToRoute = function (route) {
      assert.ok(subSaved, 'submission was not saved');
      assert.equal('submissions.new.files', route);
    };
    controller.send('loadNext');
  });
});
