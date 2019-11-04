import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | submission-handler', (hooks) => {
  setupTest(hooks);

  test('prepare submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'proxy-user-id' }
    }));

    let submissionEvent = {};

    service.set('store', Ember.Object.create({
      createRecord(type, values) {
        submissionEvent = Ember.Object.create(values);

        submissionEvent.set('save', () => {
          assert.ok(true);
          return new Promise(resolve => resolve(this));
        });

        return submissionEvent;
      }
    }));

    let repo1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = Ember.Object.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id'
      },
      metadata: '{}',
      repositories: Ember.A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = Ember.Object.create({
      id: '1',
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let files = Ember.A();
    let comment = 'blarg';

    assert.expect(13);

    return service.get('submit').perform(submission, publication, files, comment).then(() => {
      assert.equal(submission.get('submitted'), false);
      assert.equal(submission.get('submissionStatus'), 'approval-requested');

      // web-link repo should not be removed
      assert.equal(submission.get('repositories.length'), 2);

      assert.equal(submissionEvent.get('eventType'), 'approval-requested');
      assert.equal(submissionEvent.get('performerRole'), 'preparer');
      assert.equal(submissionEvent.get('performedBy.id'), 'proxy-user-id');
      assert.equal(submissionEvent.get('comment'), comment);
      assert.equal(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('submit', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'submitter:test-id' }
    }));

    let submissionEvent = {};

    service.set('store', Ember.Object.create({
      createRecord(type, values) {
        submissionEvent = Ember.Object.create(values);

        submissionEvent.set('save', () => {
          assert.ok(true);
          return new Promise(resolve => resolve(this));
        });

        return submissionEvent;
      }
    }));

    let repo1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = Ember.Object.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id'
      },
      metadata: '{}',
      repositories: Ember.A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let publication = Ember.Object.create({
      id: '1',
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let files = Ember.A();
    let comment = 'blarg';

    assert.expect(13);

    return service.get('submit').perform(submission, publication, files, comment).then(() => {
      assert.equal(submission.get('submitted'), true);
      assert.equal(submission.get('submissionStatus'), 'submitted');

      // web-link repo should NOT be removed
      assert.equal(submission.get('repositories.length'), 2);
      assert.equal(submission.get('repositories.firstObject.id'), repo1.id);

      assert.equal(submissionEvent.get('eventType'), 'submitted');
      assert.equal(submissionEvent.get('performerRole'), 'submitter');
      assert.equal(submissionEvent.get('comment'), comment);
      assert.equal(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('approve submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set('store', Ember.Object.create({
      createRecord(type, values) {
        submissionEvent = Ember.Object.create(values);

        submissionEvent.set('save', () => {
          assert.ok(true);
          return new Promise(resolve => resolve(this));
        });

        return submissionEvent;
      }
    }));

    let repo1 = Ember.Object.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = Ember.Object.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id'
      },
      metadata: '{}',
      repositories: Ember.A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'blarg';

    assert.expect(12);

    return service.approveSubmission(submission, comment).then(() => {
      assert.equal(submission.get('submitted'), true);
      assert.equal(submission.get('submissionStatus'), 'submitted');

      // web-link repo should NOT be removed and external-submissions added not on metadata
      assert.equal(submission.get('repositories.length'), 2);
      assert.equal(submission.get('repositories.firstObject.id'), repo1.id);
      assert.notOk(submission.get('metadata').includes('external-submissions'));

      assert.equal(submissionEvent.get('eventType'), 'submitted');
      assert.equal(submissionEvent.get('performerRole'), 'submitter');
      assert.equal(submissionEvent.get('comment'), comment);
      assert.equal(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('cancel submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set('store', Ember.Object.create({
      createRecord(type, values) {
        submissionEvent = Ember.Object.create(values);

        submissionEvent.set('save', () => {
          assert.ok(true);
          return new Promise(resolve => resolve(this));
        });

        return submissionEvent;
      }
    }));

    let submission = Ember.Object.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A(),
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'blarg';

    assert.expect(8);

    return service.cancelSubmission(submission, comment).then(() => {
      assert.equal(submission.get('submissionStatus'), 'cancelled');
      assert.equal(submissionEvent.get('eventType'), 'cancelled');
      assert.equal(submissionEvent.get('performerRole'), 'submitter');
      assert.equal(submissionEvent.get('comment'), comment);
      assert.equal(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('request changes', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set('store', Ember.Object.create({
      createRecord(type, values) {
        submissionEvent = Ember.Object.create(values);

        submissionEvent.set('save', () => {
          assert.ok(true);
          return new Promise(resolve => resolve(this));
        });

        return submissionEvent;
      }
    }));

    let submission = Ember.Object.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id'
      },
      repositories: Ember.A(),
      save() {
        assert.ok(true);
        return new Promise(resolve => resolve(this));
      }
    });

    let comment = 'blarg';

    assert.expect(8);

    return service.requestSubmissionChanges(submission, comment).then(() => {
      assert.equal(submission.get('submissionStatus'), 'changes-requested');
      assert.equal(submissionEvent.get('eventType'), 'changes-requested');
      assert.equal(submissionEvent.get('performerRole'), 'submitter');
      assert.equal(submissionEvent.get('comment'), comment);
      assert.equal(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  /**
   * #deleteSubmission should set submissionStatus to 'cancelled' while leaving associated
   * objects alone
   */
  test('delete submission', function (assert) {
    assert.expect(4);

    const submission = Ember.Object.create({
      submissionStatus: 'draft',
      publication: Ember.Object.create({ title: 'Moo title' }),
      save: () => Promise.resolve(),
      unloadRecord: () => {
        assert.ok(true);
        return Promise.resolve();
      }
    });

    const service = this.owner.lookup('service:submission-handler');
    const result = service.deleteSubmission(submission);

    assert.ok(result, 'No result found');
    result.then(() => {
      assert.equal(submission.get('submissionStatus'), 'cancelled', 'Unexpected status');
      assert.ok(submission.get('publication'), 'No publication found');
    });
  });
});
