/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';

module('Unit | Service | submission-handler', (hooks) => {
  setupTest(hooks);

  test('prepare submission', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'proxy-user-id' },
      }),
    );

    let submissionEvent: any = {};

    service.store = {
      createRecord(type: any, values: any) {
        submissionEvent = { ...values };

        submissionEvent.save = () => {
          assert.ok(true);
          return new Promise((resolve) => resolve(this));
        };

        return submissionEvent;
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: any = {
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
    };

    const publication = {
      id: '1',
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    };

    const comment = 'blarg';

    assert.expect(14);

    return service.submit.perform(submission, publication, comment).then(() => {
      assert.false(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'approval-requested');
      assert.strictEqual(submission.version, 3);

      // web-link repo should not be removed
      assert.strictEqual(submission.repositories.length, 2);

      assert.strictEqual(submissionEvent.eventType, 'approval-requested');
      assert.strictEqual(submissionEvent.performerRole, 'preparer');
      assert.strictEqual(submissionEvent.performedBy.id, 'proxy-user-id');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission.id, submission.id);
      assert.ok(submissionEvent.link.includes(submission.id));
    });
  });

  test('submit', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'submitter:test-id' },
      }),
    );

    let submissionEvent: any = {};

    service.store = {
      createRecord(type: any, values: any) {
        submissionEvent = { ...values };

        submissionEvent.save = () => {
          assert.ok(true);
          return new Promise((resolve) => resolve(this));
        };

        return submissionEvent;
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: any = {
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
    };

    const publication = {
      id: '1',
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    };

    const comment = 'blarg';

    assert.expect(13);

    return service.submit.perform(submission, publication, comment).then(() => {
      assert.true(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'submitted');

      // web-link repo should NOT be removed
      assert.strictEqual(submission.repositories.length, 2);
      assert.strictEqual(submission.repositories[0]!.id, repo1.id);

      assert.strictEqual(submissionEvent.eventType, 'submitted');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission.id, submission.id);
      assert.ok(submissionEvent.link.includes(submission.id));
    });
  });

  test('approve submission', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: any = {};

    service.store = {
      createRecord(type: any, values: any) {
        submissionEvent = { ...values };

        submissionEvent.save = () => {
          assert.ok(true);
          return new Promise((resolve) => resolve(this));
        };

        return submissionEvent;
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: any = {
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
    };

    const comment = 'blarg';

    assert.expect(12);

    return service.approveSubmission(submission, comment).then(() => {
      assert.true(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'submitted');

      // web-link repo should NOT be removed and external-submissions added not on metadata
      assert.strictEqual(submission.repositories.length, 2);
      assert.strictEqual(submission.repositories[0]!.id, repo1.id);
      assert.notOk(submission.metadata.includes('external-submissions'));

      assert.strictEqual(submissionEvent.eventType, 'submitted');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission.id, submission.id);
      assert.ok(submissionEvent.link.includes(submission.id));
    });
  });

  test('cancel submission', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: any = {};

    service.store = {
      createRecord(type: any, values: any) {
        submissionEvent = { ...values };

        submissionEvent.save = () => {
          assert.ok(true);
          return new Promise((resolve) => resolve(this));
        };

        return submissionEvent;
      },
    };

    const submission: any = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    };

    const comment = 'blarg';

    assert.expect(8);

    return service.cancelSubmission(submission, comment).then(() => {
      assert.strictEqual(submission.submissionStatus, 'cancelled');
      assert.strictEqual(submissionEvent.eventType, 'cancelled');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission.id, submission.id);
      assert.ok(submissionEvent.link.includes(submission.id));
    });
  });

  test('request changes', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: any = {};

    service.store = {
      createRecord(type: any, values: any) {
        submissionEvent = { ...values };

        submissionEvent.save = () => {
          assert.ok(true);
          return new Promise((resolve) => resolve(this));
        };

        return submissionEvent;
      },
    };

    const submission: any = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
      save() {
        assert.ok(true);
        return new Promise((resolve) => resolve(this));
      },
    };

    const comment = 'blarg';

    assert.expect(8);

    return service.requestSubmissionChanges(submission, comment).then(() => {
      assert.strictEqual(submission.submissionStatus, 'changes-requested');
      assert.strictEqual(submissionEvent.eventType, 'changes-requested');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission.id, submission.id);
      assert.ok(submissionEvent.link.includes(submission.id));
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
      .then((_: any) => assert.ok(false, 'Deletion should throw an error'))
      .catch((_e: any) => assert.ok(true));
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

    const query = (model: any, _filter: any) => {
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
      .catch((_e: any) => assert.ok(true));

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

    const query = (model: any, _filter: any) => {
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

    const query = (model: any, _filter: any) => {
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
