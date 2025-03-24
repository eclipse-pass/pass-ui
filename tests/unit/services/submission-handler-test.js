/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Sinon from 'sinon';

module('Unit | Service | submission-handler', (hooks) => {
  setupTest(hooks);

  test('prepare submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'proxy-user-id' },
      }),
    );

    let submissionEvent = {};

    service.set(
      'store',
      EmberObject.create({
        createRecord(type, values) {
          submissionEvent = EmberObject.create(values);

          submissionEvent.set('save', () => {
            assert.ok(true);
            return new Promise((resolve) => resolve(this));
          });

          return submissionEvent;
        },
      }),
    );

    let repo1 = EmberObject.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = EmberObject.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = EmberObject.create({
      id: '0',
      version: 3,
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let publication = EmberObject.create({
      id: '1',
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let comment = 'blarg';

    assert.expect(14);

    return service
      .get('submit')
      .perform(submission, publication, comment)
      .then(() => {
        assert.false(submission.get('submitted'));
        assert.strictEqual(submission.get('submissionStatus'), 'approval-requested');
        assert.strictEqual(submission.get('version'), 3);

        // web-link repo should not be removed
        assert.strictEqual(submission.get('repositories.length'), 2);

        assert.strictEqual(submissionEvent.get('eventType'), 'approval-requested');
        assert.strictEqual(submissionEvent.get('performerRole'), 'preparer');
        assert.strictEqual(submissionEvent.get('performedBy.id'), 'proxy-user-id');
        assert.strictEqual(submissionEvent.get('comment'), comment);
        assert.strictEqual(submissionEvent.get('submission.id'), submission.get('id'));
        assert.ok(submissionEvent.get('link').includes(submission.get('id')));
      });
  });

  test('submit', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'submitter:test-id' },
      }),
    );

    let submissionEvent = {};

    service.set(
      'store',
      EmberObject.create({
        createRecord(type, values) {
          submissionEvent = EmberObject.create(values);

          submissionEvent.set('save', () => {
            assert.ok(true);
            return new Promise((resolve) => resolve(this));
          });

          return submissionEvent;
        },
      }),
    );

    let repo1 = EmberObject.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = EmberObject.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = EmberObject.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let publication = EmberObject.create({
      id: '1',
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let comment = 'blarg';

    assert.expect(13);

    return service
      .get('submit')
      .perform(submission, publication, comment)
      .then(() => {
        assert.true(submission.get('submitted'));
        assert.strictEqual(submission.get('submissionStatus'), 'submitted');

        // web-link repo should NOT be removed
        assert.strictEqual(submission.get('repositories.length'), 2);
        assert.strictEqual(submission.repositories[0].id, repo1.id);

        assert.strictEqual(submissionEvent.get('eventType'), 'submitted');
        assert.strictEqual(submissionEvent.get('performerRole'), 'submitter');
        assert.strictEqual(submissionEvent.get('comment'), comment);
        assert.strictEqual(submissionEvent.get('submission.id'), submission.get('id'));
        assert.ok(submissionEvent.get('link').includes(submission.get('id')));
      });
  });

  test('approve submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set(
      'store',
      EmberObject.create({
        createRecord(type, values) {
          submissionEvent = EmberObject.create(values);

          submissionEvent.set('save', () => {
            assert.ok(true);
            return new Promise((resolve) => resolve(this));
          });

          return submissionEvent;
        },
      }),
    );

    let repo1 = EmberObject.create({ id: 'test:repo1', integrationType: 'full' });
    let repo2 = EmberObject.create({ id: 'test:repo2', integrationType: 'web-link' });

    let submission = EmberObject.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let comment = 'blarg';

    assert.expect(12);

    return service.approveSubmission(submission, comment).then(() => {
      assert.true(submission.get('submitted'));
      assert.strictEqual(submission.get('submissionStatus'), 'submitted');

      // web-link repo should NOT be removed and external-submissions added not on metadata
      assert.strictEqual(submission.get('repositories.length'), 2);
      assert.strictEqual(submission.repositories[0].id, repo1.id);
      assert.notOk(submission.get('metadata').includes('external-submissions'));

      assert.strictEqual(submissionEvent.get('eventType'), 'submitted');
      assert.strictEqual(submissionEvent.get('performerRole'), 'submitter');
      assert.strictEqual(submissionEvent.get('comment'), comment);
      assert.strictEqual(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('cancel submission', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set(
      'store',
      EmberObject.create({
        createRecord(type, values) {
          submissionEvent = EmberObject.create(values);

          submissionEvent.set('save', () => {
            assert.ok(true);
            return new Promise((resolve) => resolve(this));
          });

          return submissionEvent;
        },
      }),
    );

    let submission = EmberObject.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let comment = 'blarg';

    assert.expect(8);

    return service.cancelSubmission(submission, comment).then(() => {
      assert.strictEqual(submission.get('submissionStatus'), 'cancelled');
      assert.strictEqual(submissionEvent.get('eventType'), 'cancelled');
      assert.strictEqual(submissionEvent.get('performerRole'), 'submitter');
      assert.strictEqual(submissionEvent.get('comment'), comment);
      assert.strictEqual(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('request changes', function (assert) {
    let service = this.owner.lookup('service:submission-handler');

    let submissionEvent = {};

    service.set(
      'store',
      EmberObject.create({
        createRecord(type, values) {
          submissionEvent = EmberObject.create(values);

          submissionEvent.set('save', () => {
            assert.ok(true);
            return new Promise((resolve) => resolve(this));
          });

          return submissionEvent;
        },
      }),
    );

    let submission = EmberObject.create({
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    });

    let comment = 'blarg';

    assert.expect(8);

    return service.requestSubmissionChanges(submission, comment).then(() => {
      assert.strictEqual(submission.get('submissionStatus'), 'changes-requested');
      assert.strictEqual(submissionEvent.get('eventType'), 'changes-requested');
      assert.strictEqual(submissionEvent.get('performerRole'), 'submitter');
      assert.strictEqual(submissionEvent.get('comment'), comment);
      assert.strictEqual(submissionEvent.get('submission.id'), submission.get('id'));
      assert.ok(submissionEvent.get('link').includes(submission.get('id')));
    });
  });

  test('cannot delete non-draft submissions', function (assert) {
    const submission = {
      submissionStatus: 'not-draft',
      publication: { title: 'Moo title' },
      save: () => Promise.resolve(),
    };

    const service = this.owner.lookup('service:submission-handler');

    service
      .deleteSubmission(submission)
      .then((_) => assert.fail('Deletion should throw an error'))
      .catch((_e) => assert.ok(true));
  });

  test('File deletion failure kills the submission deletion process', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    const submission = {
      source: 'pass',
      submissionStatus: 'draft',
      publication: {
        title: 'Moo Title',
        save: Sinon.fake.resolves(),
        deleteRecord: Sinon.fake.resolves(),
      },
      save: Sinon.fake.resolves(),
      deleteRecord: Sinon.fake.resolves(),
    };

    const query = (model, _filter) => {
      switch (model) {
        case 'file':
          // Get files for the submission
          return Promise.resolve([
            { name: 'file1', submission: 0, destroyRecord: Sinon.fake.rejects() },
            { name: 'file2', submission: 0, destroyRecord: Sinon.fake.rejects() },
          ]);
        case 'submission':
          return Promise.resolve([submission]); // Get submissions that share the same Publication
        default:
          return Promise.reject();
      }
    };
    const storeQueryFake = Sinon.replace(store, 'query', Sinon.spy(query));
    this.owner.register('service:store', store);

    await service
      .deleteSubmission(submission)
      // Fail test on positive return
      .then(() => assert.ok(false, 'Delete submission is expected to not succeed'))
      .catch((_e) => assert.ok(true));

    assert.ok(storeQueryFake.calledOnce, 'Store query should be called only once');
    assert.equal(submission.deleteRecord.callCount, 0, 'Submission delete should not be called');
    assert.equal(submission.save.callCount, 0, 'Submission should not be saved');
  });

  test('Publication not deleted if multiple submissions reference it', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    const publication = {
      title: 'Moo Title',
      save: Sinon.fake.resolves(),
      deleteRecord: Sinon.fake.resolves(),
    };
    const submission = {
      id: 0,
      source: 'pass',
      submissionStatus: 'draft',
      publication,
      save: Sinon.fake.resolves(),
      deleteRecord: Sinon.fake.resolves(),
    };

    const query = (model, _filter) => {
      switch (model) {
        case 'file':
          // Get files for the submission
          return Promise.resolve([
            { name: 'file1', submission: 0, destroyRecord: Sinon.fake.resolves() },
            { name: 'file2', submission: 0, destroyRecord: Sinon.fake.resolves() },
          ]);
        case 'submission':
          // 2 submissions use the same Publication
          return Promise.resolve([submission, { id: 1, publication }]);
        default:
          return Promise.reject();
      }
    };

    const storeQueryFake = Sinon.replace(store, 'query', Sinon.fake(query));
    this.owner.register('service:store', store);

    await service.deleteSubmission(submission);

    assert.equal(storeQueryFake.callCount, 2, 'Store query should be called twice');
    assert.ok(submission.deleteRecord.calledOnce, 'Submission delete should be called');
    assert.ok(submission.save.calledOnce, 'Submission should be saved');
    assert.equal(publication.deleteRecord.callCount, 0, 'Publication should not be deleted');
    assert.equal(publication.save.callCount, 0, 'Publication should not be re-persisted');
  });

  test('Submission, publication, and files are deleted', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    const publication = {
      title: 'Moo Title',
      save: Sinon.fake.resolves(),
      deleteRecord: Sinon.fake.resolves(),
    };
    const submission = {
      id: 0,
      source: 'pass',
      submissionStatus: 'draft',
      publication,
      save: Sinon.fake.resolves(),
      deleteRecord: Sinon.fake.resolves(),
    };
    const files = [
      { name: 'file1', submission, destroyRecord: Sinon.fake.resolves() },
      { name: 'file2', submission, destroyRecord: Sinon.fake.resolves() },
    ];

    const query = (model, _filter) => {
      switch (model) {
        case 'file':
          // Get files for the submission
          return Promise.resolve(files);
        case 'submission':
          return Promise.resolve([]);
        default:
          return Promise.reject();
      }
    };

    const storeQueryFake = Sinon.replace(store, 'query', Sinon.fake(query));
    this.owner.register('service:store', store);

    await service.deleteSubmission(submission);

    assert.equal(storeQueryFake.callCount, 2, 'Store query should be called twice');
    assert.ok(submission.deleteRecord.calledOnce, 'Submission delete should be called');
    assert.ok(submission.save.calledOnce, 'Submission should be saved');
    assert.ok(publication.deleteRecord.calledOnce, 'Publication should be deleted');
    assert.ok(publication.save.calledOnce, 'Publication deletion should be persisted');
    assert.ok(
      files.map((f) => f.destroyRecord).every((func) => func.calledOnce),
      'All files should be destroyed',
    );
  });
});
