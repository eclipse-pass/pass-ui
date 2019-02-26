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

  test('finish and save non-proxy submission', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-id' }
    }));

    let submissionEvent = Ember.Object.create({ });
    controller.set('store', {
      createRecord() { return submissionEvent; }
    });

    let submissionSaved = false;
    // 2 repositories so we can check web-link repo is removed from list
    let repository1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repository2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link' });
    let submission = Ember.Object.create({
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A([repository1, repository2]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => (assert.ok(true)));
      }
    });
    controller.set('comment', 'test comment');

    run(() => {
      controller.send('finishSubmission', submission);
    });

    assert.equal(submission.submissionStatus, 'submitted');
    // check web-linked repo is removed
    assert.equal(submission.repositories.length, 1);
    assert.equal(submission.repositories[0].id, 'test:repo1');
    assert.equal(submissionEvent.comment, 'test comment');
    assert.equal(submissionEvent.performedBy.id, 'submitter:test-id');
    assert.equal(submissionEvent.submission.submitter.id, 'submitter:test-id');
    assert.equal(submissionEvent.comment, 'test comment');
    assert.equal(submissionEvent.performerRole, 'submitter');
    assert.equal(submissionEvent.eventType, 'submitted');
    // because the promise doesnt return anything at the moment,
    // only submission will be saved
    assert.equal(submissionSaved, true);
  });

  test('finish and save proxy submission', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionEvent = Ember.Object.create({ });
    controller.set('store', {
      createRecord() { return submissionEvent; }
    });

    let submissionSaved = false;
    let repository1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repository2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'one-way' });
    let submission = Ember.Object.create({
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A([repository1, repository2]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => (assert.ok(true)));
      }
    });
    controller.set('comment', 'test comment');

    run(() => {
      controller.send('finishSubmission', submission);
    });

    assert.equal(submission.submissionStatus, 'approval-requested');
    assert.equal(submission.repositories.length, 2);
    assert.equal(submissionEvent.comment, 'test comment');
    assert.equal(submissionEvent.performedBy.id, 'submitter:test-proxy-id');
    assert.equal(submissionEvent.submission.submitter.id, 'submitter:test-id');
    assert.equal(submissionEvent.comment, 'test comment');
    assert.equal(submissionEvent.performerRole, 'preparer');
    assert.equal(submissionEvent.eventType, 'approval-requested');
    // because the promise doesnt return anything at the moment,
    // only submission will be saved
    assert.equal(submissionSaved, true);
  });

  test('finish and save proxy submission with new user', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new');
    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-proxy-id' }
    }));

    let submissionEvent = Ember.Object.create({ });
    controller.set('store', {
      createRecord() { return submissionEvent; }
    });

    let submissionSaved = false;
    let repository = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let submission = Ember.Object.create({
      submitterName: 'test name',
      submitterEmail: 'mailto:test@email.com',
      repositories: Ember.A([repository]),
      save() {
        submissionSaved = true;
        return new Promise(resolve => (assert.ok(true)));
      }
    });

    run(() => {
      controller.send('finishSubmission', submission);
    });

    assert.equal(submission.submitter, null);
    assert.equal(submission.submitterName, 'test name');
    assert.equal(submission.submitterEmail, 'mailto:test@email.com');
    assert.equal(submission.submissionStatus, 'approval-requested');
    assert.equal(submission.repositories.length, 1);
    assert.equal(submissionEvent.performedBy.id, 'submitter:test-proxy-id');
    assert.equal(submissionEvent.performerRole, 'preparer');
    assert.equal(submissionEvent.eventType, 'approval-requested-newuser');
    // because the promise doesnt return anything at the moment,
    // only submission will be saved
    assert.equal(submissionSaved, true);
  });
});
