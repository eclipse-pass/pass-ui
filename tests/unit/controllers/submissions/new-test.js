import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

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

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = Ember.Object.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', Ember.Object.create({
      createRecord() { return submissionEvent; }
    }));

    let repository1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repository2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = Ember.Object.create({
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A([repository1, repository2]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = Ember.Object.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let file = Ember.Object.create({
      fileRole: 'manuscript'
    });

    let comment = 'moo';

    let model = Ember.Object.create({
      newSubmission: submission,
      files: Ember.A([file]),
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

      assert.equal(submission.submitted, true);
      assert.equal(submission.submissionStatus, 'submitted');

      // check web-linked repo is removed
      assert.equal(submission.repositories.length, 1);
      assert.equal(submission.repositories[0].id, 'test:repo1');

      assert.equal(submissionEvent.submission.submitter.id, 'submitter:test-id');
      assert.equal(submissionEvent.performedBy.id, 'submitter:test-id');
      assert.equal(submissionEvent.performerRole, 'submitter');
      assert.equal(submissionEvent.comment, comment);
      assert.equal(submissionEvent.eventType, 'submitted');
    });

    controller.set('model', model);
    controller.set('comment', comment);
    controller.set('filesTemp', Ember.A());

    controller.send('submit');
  });

  test('finish and save proxy submission', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    let submissionHandler = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = Ember.Object.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', Ember.Object.create({
      createRecord() { return submissionEvent; }
    }));

    let repository = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });

    let submission = Ember.Object.create({
      id: 'sub:0',
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A([repository]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = Ember.Object.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'moo';

    let model = Ember.Object.create({
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
    controller.set('filesTemp', Ember.A());

    controller.send('submit');
  });

  test('finish and save proxy submission with new user', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    let submissionHandler = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionSaved = false;
    let submissionEventSaved = false;
    let publicationSaved = false;

    let submissionEvent = Ember.Object.create({
      save() {
        submissionEventSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    submissionHandler.set('store', Ember.Object.create({
      createRecord() { return submissionEvent; }
    }));

    let repository = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });

    let submission = Ember.Object.create({
      id: 'sub:0',
      submitterName: 'test name',
      submitterEmail: 'mailto:test@email.com',
      repositories: Ember.A([repository]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = Ember.Object.create({
      id: 'pub:0',
      save() {
        publicationSaved = true;
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'moo';

    let model = Ember.Object.create({
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
    controller.set('filesTemp', Ember.A());

    controller.send('submit');
  });
});
