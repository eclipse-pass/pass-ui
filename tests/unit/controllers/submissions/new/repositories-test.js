import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/repositories', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/repositories');
    assert.ok(controller);
  });

  test('transition aborted if no repositories', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/repositories');
    this.owner.register('service:workflow', Ember.Object.extend({
      getMaxStep() { return 5; }
    }));
    let submission = Ember.Object.create({
      repositories: []
    });
    let model = Ember.Object.create({
      newSubmission: submission
    });
    controller.set('model', model);
    let loadTabAccessed = false;
    controller.transitionToRoute = function () {
      loadTabAccessed = true;
    };
    // override swal so it doesn't pop up
    swal = result => new Promise(resolve => (assert.ok(true)));
    controller.send('validateAndLoadTab');
    assert.equal(loadTabAccessed, false);
  });

  test('transition if there are repositories', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/repositories');
    this.owner.register('service:workflow', Ember.Object.extend({
      getMaxStep() { return 5; }
    }));

    let repository = Ember.Object.create({
      id: 'test:repo',
      formSchema: '{ "id": "nih", "title": "med data" }'
    });
    let submission = Ember.Object.create({
      repositories: Ember.A([repository])
    });
    let model = Ember.Object.create({
      newSubmission: submission
    });
    controller.set('model', model);
    let loadTabAccessed = false;
    controller.transitionToRoute = function () {
      loadTabAccessed = true;
    };
    controller.send('validateAndLoadTab');
    assert.equal(loadTabAccessed, true);
  });

  test('updateRelatedData removes metadata for repos not assigned', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/repositories');
    let repository = Ember.Object.create({
      id: 'test:repo',
      formSchema: '{ "id": "nih", "title": "med data" }'
    });

    let md = '[{"id": "foo", "title": "bar"}, {"id": "nih", "title": "med data"}]';
    let submission = Ember.Object.create({
      repositories: Ember.A([repository]),
      metadata: md
    });
    let model = Ember.Object.create({
      newSubmission: submission
    });
    controller.set('model', model);
    assert.equal(controller.get('submission.metadata'), md);
    controller.send('updateRelatedData');
    // check the metadata that does not match a repo has been removed.
    let updatedMetadata = JSON.parse(controller.get('submission.metadata'));
    assert.equal(updatedMetadata[0].id, 'nih');
    assert.equal(updatedMetadata.length, 1);
  });
});
