import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    assert.ok(controller);
  });

  test('finish and save non-proxy submission', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    let submissionHandler = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', EmberObject.extend({
      user: { id: 'submitter:test-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = EmberObject.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', EmberObject.create({
      createRecord() { return submissionEvent; }
    }));

    let repository1 = EmberObject.create({
      id: 'test:repo1',
      integrationType: 'full',
      name: 'moo',
      agreementText: 'Milk cows',
      _isWebLink: false
    });
    let repository2 = EmberObject.create({
      id: 'test:repo2',
      integrationType: 'web-link',
      _isWebLink: true
    });

    let submission = EmberObject.create({
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id'
      },
      metadata: '{}',
      repositories: A([repository1, repository2]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = EmberObject.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let file = EmberObject.create({
      fileRole: 'manuscript'
    });

    let comment = 'moo';

    let model = EmberObject.create({
      newSubmission: submission,
      files: A([file]),
      publication
    });

    assert.expect(16);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.
    controller.set('transitionToRoute', (name) => {
      assert.equal(name, 'thanks');

      assert.equal(publicationSaved, true);
      assert.equal(submissionSaved, true);
      assert.equal(submissionEventSaved, true);

      assert.equal(submission.submitted, true);
      assert.equal(submission.submissionStatus, 'submitted');

      // check web-linked repo is NOT removed
      assert.equal(submission.repositories.length, 2);
      assert.equal(submission.repositories[0].id, 'test:repo1');

      assert.equal(submissionEvent.submission.submitter.id, 'submitter:test-id');
      assert.equal(submissionEvent.performedBy.id, 'submitter:test-id');
      assert.equal(submissionEvent.performerRole, 'submitter');
      assert.equal(submissionEvent.comment, comment);
      assert.equal(submissionEvent.eventType, 'submitted');

      let md = JSON.parse(submission.get('metadata'));
      assert.ok(md.agreements);
      assert.equal(md.agreements.length, 1);
      assert.deepEqual(md.agreements[0], {
        moo: 'Milk cows'
      });
    });

    controller.set('model', model);
    controller.set('comment', comment);
    controller.set('filesTemp', A());

    controller.send('submit');
  });

  test('finish and save proxy submission', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    let submissionHandler = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', EmberObject.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = EmberObject.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', EmberObject.create({
      createRecord() { return submissionEvent; }
    }));

    let repository = EmberObject.create({ id: 'test:repo1', integrationType: 'full' });

    let submission = EmberObject.create({
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: A([repository]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = EmberObject.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'moo';

    let model = EmberObject.create({
      newSubmission: submission,
      publication
    });

    assert.expect(11);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.
    controller.set('transitionToRoute', (name) => {
      assert.equal(name, 'thanks');

      assert.equal(publicationSaved, true);
      assert.equal(submissionSaved, true);
      assert.equal(submissionEventSaved, true);

      assert.equal(submission.submissionStatus, 'approval-requested');
      assert.equal(submission.repositories.length, 1);
      assert.equal(submissionEvent.submission.submitter.id, 'submitter:test-id');
      assert.equal(submissionEvent.performedBy.id, 'submitter:test-proxy-id');
      assert.equal(submissionEvent.performerRole, 'preparer');
      assert.equal(submissionEvent.eventType, 'approval-requested');
      assert.equal(submissionEvent.comment, comment);
    });

    controller.set('model', model);
    controller.set('comment', comment);
    controller.set('filesTemp', A());

    controller.send('submit');
  });

  test('finish and save proxy submission with new user', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    let submissionHandler = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', EmberObject.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = EmberObject.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', EmberObject.create({
      createRecord() { return submissionEvent; }
    }));

    let repository = EmberObject.create({ id: 'test:repo1', integrationType: 'full' });

    let submission = EmberObject.create({
      id: 'sub:0',
      submitterName: 'test name',
      submitterEmail: 'mailto:test@email.com',
      repositories: A([repository]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = EmberObject.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'moo';

    let model = EmberObject.create({
      newSubmission: submission,
      publication
    });

    assert.expect(13);

    // After the route transition to thanks, all promises should be resolved handler
    // and tests can be run.
    controller.set('transitionToRoute', (name) => {
      assert.equal(name, 'thanks');

      assert.equal(publicationSaved, true);
      assert.equal(submissionSaved, true);
      assert.equal(submissionEventSaved, true);

      assert.equal(submission.submitter, null);
      assert.equal(submission.submitterName, 'test name');
      assert.equal(submission.submitterEmail, 'mailto:test@email.com');
      assert.equal(submission.submissionStatus, 'approval-requested');
      assert.equal(submission.repositories.length, 1);
      assert.equal(submissionEvent.performedBy.id, 'submitter:test-proxy-id');
      assert.equal(submissionEvent.performerRole, 'preparer');
      assert.equal(submissionEvent.eventType, 'approval-requested-newuser');
      assert.equal(submissionEvent.comment, comment);
    });

    controller.set('model', model);
    controller.set('comment', comment);
    controller.set('filesTemp', A());

    controller.send('submit');
  });

  /**
   * Three things are mocked, each of which run an assertion (that always passes). This
   * test passes when exactly 3 assertions are run, and the controller tries to transition
   * to the expected route.
   *
   * This action should first create a SweetAlert (swal), then call 'deleteSubmission' in the
   * submission handler, finally call 'transitionToRoute' to transition to the 'submissions'
   * route.
   */
  test('abort should delete submission and transition', async function (assert) {
    assert.expect(3);

    const model = EmberObject.create({
      newSubmission: EmberObject.create()
    });
    const controller = this.owner.lookup('controller:submissions/new');

    controller.set('model', model);

    // Mock global 'swal' for this test
    swal = () => {
      assert.ok(true);
      return Promise.resolve({
        value: 'moo'
      });
    };

    // Having this mocked function run shows that the service will delete the submission
    controller.set('submissionHandler', EmberObject.create({
      deleteSubmission(sub) {
        assert.ok(sub);
        return Promise.resolve();
      }
    }));
    controller.set('transitionToRoute', (name) => {
      assert.equal(name, 'submissions', 'unexpected transition was named');
    });

    controller.send('abort');
  });
});
