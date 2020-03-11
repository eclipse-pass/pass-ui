import { A } from '@ember/array';
import EmberObject from '@ember/object';
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
    this.owner.register('service:workflow', EmberObject.extend({
      getMaxStep() { return 5; }
    }));
    let submission = EmberObject.create({
      repositories: []
    });
    let model = EmberObject.create({
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
    assert.ok(2);

    let controller = this.owner.lookup('controller:submissions/new/repositories');
    this.owner.register('service:workflow', EmberObject.extend({
      getMaxStep() { return 5; }
    }));

    let repository = EmberObject.create({
      id: 'test:repo',
      formSchema: '{ "id": "nih", "title": "med data" }'
    });
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        repositories: A([repository]),
        save: () => Promise.resolve(assert.ok(true))
      })
    });
    controller.set('model', model);

    controller.transitionToRoute = function () {
      assert.ok(true);
    };
    controller.send('validateAndLoadTab');
  });

  // test('updateRelatedData removes metadata for repos not assigned', function (assert) {
  //   let controller = this.owner.lookup('controller:submissions/new/repositories');
  //   let repository = Ember.Object.create({
  //     id: 'test:repo',
  //     formSchema: '{ "id": "nih", "title": "med data" }'
  //   });

  //   let md = '[{"id": "foo", "title": "bar"}, {"id": "nih", "title": "med data"}]';
  //   let submission = Ember.Object.create({
  //     repositories: Ember.A([repository]),
  //     metadata: md
  //   });
  //   let model = Ember.Object.create({
  //     newSubmission: submission
  //   });
  //   controller.set('model', model);
  //   assert.equal(controller.get('submission.metadata'), md);
  //   controller.send('updateRelatedData');
  //   // check the metadata that does not match a repo has been removed.
  //   let updatedMetadata = JSON.parse(controller.get('submission.metadata'));
  //   assert.equal(updatedMetadata[0].id, 'nih');
  //   assert.equal(updatedMetadata.length, 1);
  // });

  test('should save submission on transition', function (assert) {
    assert.ok(4);

    let subSaved = false;

    const controller = this.owner.lookup('controller:submissions/new/repositories');

    const repositories = A([
      EmberObject.create({
        id: 'test:repo',
        formSchema: '{ "id": "nih", "title": "med data" }'
      })
    ]);
    const model = EmberObject.create({
      newSubmission: EmberObject.create({
        repositories,
        save: () => {
          subSaved = true;
          return Promise.resolve();
        }
      })
    });

    controller.set('model', model);
    controller.set(
      'transitionToRoute',
      route => assert.ok(['submissions.new.metadata', 'submissions.new.policies'].includes(route))
    );

    controller.send('loadNext');
    assert.ok(subSaved);

    subSaved = false;
    controller.send('loadPrevious');
    assert.ok(subSaved);
  });

  // This test did absolutely nothing...
  // test('Moo', async function (assert) {
  //   const repo1 = Ember.Object.create({ name: 'Moo repo 1' });
  //   const repo2 = Ember.Object.create({ name: 'Moo repo 2' });

  //   const funder1 = Ember.Object.create({
  //     name: 'Moo funder 1',
  //     repositories: Ember.A([repo1])
  //   });
  //   const funder2 = Ember.Object.create({
  //     name: 'Moo funder 2',
  //     repositories: Ember.A([repo1, repo2])
  //   });


  //   const grants = Ember.A([
  //     Ember.Object.create({
  //       primaryFunder: funder1,
  //       directFunder: funder1
  //     }),
  //     Ember.Object.create({
  //       primaryFunder: funder2,
  //       directFunder: funder2
  //     })
  //   ]);

  //   const model = Ember.Object.create({
  //     newSubmission: Ember.Object.create({
  //       repositories: Ember.A(),
  //       grants
  //     })
  //   });

  //   this.set('model', model);

  //   const router = this.owner.lookup('router:submission.new.repositories');
  //   assert.ok(router, 'No router found');
  // });
});
