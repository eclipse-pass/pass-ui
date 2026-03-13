/* eslint-disable ember/no-classic-classes */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';
import type SubmissionsNewRepositories from 'pass-ui/controllers/submissions/new/repositories';
import type AppStore from 'pass-ui/services/store';

module('Unit | Controller | submissions/new/repositories', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/repositories') as SubmissionsNewRepositories;
    assert.ok(controller);
  });

  test('transition aborted if no repositories', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/repositories') as SubmissionsNewRepositories;
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getMaxStep() {
          return 7;
        },
      }),
    );
    const submission = {
      repositories: [],
    };
    const model = {
      newSubmission: submission,
    };
    controller.model = model as unknown as typeof controller.model;
    let loadTabAccessed = false;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((_route: string) => {
      loadTabAccessed = true;
    }) as typeof routerService.transitionTo;
    // override swal so it doesn't pop up
    const swalStub = Sinon.stub(Swal, 'fire').resolves(() => assert.ok(true));
    controller.send('validateAndLoadTab');
    assert.false(loadTabAccessed);
    swalStub.restore();
  });

  test('transition if there are repositories', function (assert) {
    assert.ok(2);

    const controller = this.owner.lookup('controller:submissions/new/repositories') as SubmissionsNewRepositories;
    this.owner.register(
      'service:workflow',
      EmberObject.extend({
        getMaxStep() {
          return 5;
        },
      }),
    );

    const repository = {
      id: 'test:repo',
      formSchema: '{ "id": "nih", "title": "med data" }',
    };
    const model = {
      newSubmission: {
        repositories: A([repository]),
      },
    };
    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      assert.ok(true);
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((_route: string) => {
      assert.ok(true);
    }) as typeof routerService.transitionTo;
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
  //   assert.strictEqual(controller.get('submission.metadata'), md);
  //   controller.send('updateRelatedData');
  //   // check the metadata that does not match a repo has been removed.
  //   let updatedMetadata = JSON.parse(controller.get('submission.metadata'));
  //   assert.strictEqual(updatedMetadata[0].id, 'nih');
  //   assert.strictEqual(updatedMetadata.length, 1);
  // });

  test('should save submission on transition', function (assert) {
    assert.ok(4);

    let subSaved = false;

    const controller = this.owner.lookup('controller:submissions/new/repositories') as SubmissionsNewRepositories;

    const repositories = A([
      {
        id: 'test:repo',
        formSchema: '{ "id": "nih", "title": "med data" }',
      },
    ]);
    const model = {
      newSubmission: {
        repositories,
      },
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = (() => {
      subSaved = true;
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = ((route: string) => {
      assert.ok(['submissions.new.metadata', 'submissions.new.policies'].includes(route));
    }) as typeof routerService.transitionTo;

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
