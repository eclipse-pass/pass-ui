/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects */
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';

interface MockSubmission {
  id: string | number;
  version?: number;
  submitted?: boolean;
  submissionStatus?: string;
  submitter: { id: string };
  metadata?: string;
  repositories?: { id: string; integrationType: string }[];
  publication?: { title: string };
  source?: string;
}

interface MockSubmissionEvent {
  eventType?: string;
  performerRole?: string;
  performedBy?: { id: string };
  comment?: string;
  submission?: { id: string | number };
  link?: string;
  [key: string]: unknown;
}

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

    let submissionEvent: MockSubmissionEvent = {};

    service.store = {
      createRecord(_type: string, values: Record<string, unknown>) {
        submissionEvent = { ...values };
        return submissionEvent;
      },
      persistRecord() {
        assert.ok(true);
        return Promise.resolve({ content: {} });
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: MockSubmission = {
      id: '0',
      version: 3,
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
    };

    const publication = {
      id: '1',
    };

    const comment = 'blarg';

    assert.expect(14);

    return service.submit.perform(submission, publication, comment).then(() => {
      assert.false(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'approval-requested');
      assert.strictEqual(submission.version, 3);

      // web-link repo should not be removed
      assert.strictEqual(submission.repositories!.length, 2);

      assert.strictEqual(submissionEvent.eventType, 'approval-requested');
      assert.strictEqual(submissionEvent.performerRole, 'preparer');
      assert.strictEqual(submissionEvent.performedBy!.id, 'proxy-user-id');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission!.id, submission.id);
      assert.ok(submissionEvent.link!.includes(String(submission.id)));
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

    let submissionEvent: MockSubmissionEvent = {};

    service.store = {
      createRecord(_type: string, values: Record<string, unknown>) {
        submissionEvent = { ...values };
        return submissionEvent;
      },
      persistRecord() {
        assert.ok(true);
        return Promise.resolve({ content: {} });
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: MockSubmission = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
    };

    const publication = {
      id: '1',
    };

    const comment = 'blarg';

    assert.expect(13);

    return service.submit.perform(submission, publication, comment).then(() => {
      assert.true(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'submitted');

      // web-link repo should NOT be removed
      assert.strictEqual(submission.repositories!.length, 2);
      assert.strictEqual(submission.repositories![0]!.id, repo1.id);

      assert.strictEqual(submissionEvent.eventType, 'submitted');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission!.id, submission.id);
      assert.ok(submissionEvent.link!.includes(String(submission.id)));
    });
  });

  test('approve submission', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: MockSubmissionEvent = {};

    service.store = {
      createRecord(_type: string, values: Record<string, unknown>) {
        submissionEvent = { ...values };
        return submissionEvent;
      },
      persistRecord() {
        assert.ok(true);
        return Promise.resolve({ content: {} });
      },
    };

    const repo1 = { id: 'test:repo1', integrationType: 'full' };
    const repo2 = { id: 'test:repo2', integrationType: 'web-link' };

    const submission: MockSubmission = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      metadata: '{}',
      repositories: A([repo1, repo2]),
    };

    const comment = 'blarg';

    assert.expect(12);

    return service.approveSubmission(submission, comment).then(() => {
      assert.true(submission.submitted);
      assert.strictEqual(submission.submissionStatus, 'submitted');

      // web-link repo should NOT be removed and external-submissions added not on metadata
      assert.strictEqual(submission.repositories!.length, 2);
      assert.strictEqual(submission.repositories![0]!.id, repo1.id);
      assert.notOk(submission.metadata!.includes('external-submissions'));

      assert.strictEqual(submissionEvent.eventType, 'submitted');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission!.id, submission.id);
      assert.ok(submissionEvent.link!.includes(String(submission.id)));
    });
  });

  test('cancel submission', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: MockSubmissionEvent = {};

    service.store = {
      createRecord(_type: string, values: Record<string, unknown>) {
        submissionEvent = { ...values };
        return submissionEvent;
      },
      persistRecord() {
        assert.ok(true);
        return Promise.resolve({ content: {} });
      },
    };

    const submission: MockSubmission = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
    };

    const comment = 'blarg';

    assert.expect(8);

    return service.cancelSubmission(submission, comment).then(() => {
      assert.strictEqual(submission.submissionStatus, 'cancelled');
      assert.strictEqual(submissionEvent.eventType, 'cancelled');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission!.id, submission.id);
      assert.ok(submissionEvent.link!.includes(String(submission.id)));
    });
  });

  test('request changes', function (assert) {
    const service = this.owner.lookup('service:submission-handler');

    let submissionEvent: MockSubmissionEvent = {};

    service.store = {
      createRecord(_type: string, values: Record<string, unknown>) {
        submissionEvent = { ...values };
        return submissionEvent;
      },
      persistRecord() {
        assert.ok(true);
        return Promise.resolve({ content: {} });
      },
    };

    const submission: MockSubmission = {
      id: '0',
      submitter: {
        id: 'submitter:test-id',
      },
      repositories: A(),
    };

    const comment = 'blarg';

    assert.expect(8);

    return service.requestSubmissionChanges(submission, comment).then(() => {
      assert.strictEqual(submission.submissionStatus, 'changes-requested');
      assert.strictEqual(submissionEvent.eventType, 'changes-requested');
      assert.strictEqual(submissionEvent.performerRole, 'submitter');
      assert.strictEqual(submissionEvent.comment, comment);
      assert.strictEqual(submissionEvent.submission!.id, submission.id);
      assert.ok(submissionEvent.link!.includes(String(submission.id)));
    });
  });

  test('cannot delete non-draft submissions', function (assert) {
    const submission = {
      submissionStatus: 'not-draft',
      publication: { title: 'Moo title' },
    };

    const service = this.owner.lookup('service:submission-handler');

    service
      .deleteSubmission(submission)
      .then(() => assert.ok(false, 'Deletion should throw an error'))
      .catch(() => assert.ok(true));
  });

  test('File deletion failure kills the submission deletion process', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    const submission = {
      source: 'pass',
      submissionStatus: 'draft',
      publication: {
        title: 'Moo Title',
      },
    };

    const requestHandler = (req: { url: string }) => {
      if (req.url.includes('/data/file')) {
        // Get files for the submission
        return Promise.resolve({
          content: {
            data: [
              { name: 'file1', submission: 0, uri: '/file/test1' },
              { name: 'file2', submission: 0, uri: '/file/test2' },
            ],
          },
        });
      } else if (req.url.includes('/data/submission')) {
        return Promise.resolve({ content: { data: [submission] } }); // Get submissions that share the same Publication
      }
      return Promise.reject();
    };
    const storeRequestFake = Sinon.replace(store, 'request', Sinon.spy(requestHandler));
    const storeDestroyFake = Sinon.replace(store, 'destroyRecord', Sinon.fake.rejects('destroy failed'));
    this.owner.register('service:store', store);

    await service
      .deleteSubmission(submission)
      // Fail test on positive return
      .then(() => assert.ok(false, 'Delete submission is expected to not succeed'))
      .catch(() => assert.ok(true));

    assert.ok(storeRequestFake.calledOnce, 'Store request should be called only once');
    assert.equal(storeDestroyFake.callCount, 0, 'Store destroyRecord should not be called (fetch fails first)');
  });

  test('Publication not deleted if multiple submissions reference it', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    // Stub fetch and cookie for deleteFileWithBytes
    const originalCookie = document.cookie;
    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response(null, { status: 200 }));

    const publication = {
      title: 'Moo Title',
    };
    const submission = {
      id: 0,
      source: 'pass',
      submissionStatus: 'draft',
      publication,
    };

    const requestHandler = (req: { url: string }) => {
      if (req.url.includes('/data/file')) {
        // Get files for the submission
        return Promise.resolve({
          content: {
            data: [
              { name: 'file1', submission: 0, uri: '/file/test1' },
              { name: 'file2', submission: 0, uri: '/file/test2' },
            ],
          },
        });
      } else if (req.url.includes('/data/submission')) {
        // 2 submissions use the same Publication
        return Promise.resolve({ content: { data: [submission, { id: 1, publication }] } });
      }
      return Promise.reject();
    };

    const storeRequestFake = Sinon.replace(store, 'request', Sinon.fake(requestHandler));
    const storeDestroyFake = Sinon.replace(store, 'destroyRecord', Sinon.fake.resolves());
    this.owner.register('service:store', store);

    try {
      await service.deleteSubmission(submission);

      assert.equal(storeRequestFake.callCount, 2, 'Store request should be called twice');
      // destroyRecord called for: file1, file2, submission = 3 times (no publication since other subs reference it)
      assert.equal(
        storeDestroyFake.callCount,
        3,
        'Store destroyRecord should be called 3 times (2 files + submission)',
      );
      // Verify the submission was destroyed
      assert.ok(storeDestroyFake.calledWith(submission), 'Submission should be destroyed');
      // Verify publication was NOT destroyed
      assert.notOk(storeDestroyFake.calledWith(publication), 'Publication should not be destroyed');
    } finally {
      fetchStub.restore();
      document.cookie = `XSRF-TOKEN=; expires=${new Date(0).toUTCString()}`;
      if (originalCookie) {
        document.cookie = originalCookie;
      }
    }
  });

  test('Submission, publication, and files are deleted', async function (assert) {
    const service = this.owner.lookup('service:submission-handler');
    const store = this.owner.lookup('service:store');

    // Stub fetch and cookie for deleteFileWithBytes
    const originalCookie = document.cookie;
    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response(null, { status: 200 }));

    const publication = {
      title: 'Moo Title',
    };
    const submission = {
      id: 0,
      source: 'pass',
      submissionStatus: 'draft',
      publication,
    };
    const files = [
      { name: 'file1', submission, uri: '/file/test1' },
      { name: 'file2', submission, uri: '/file/test2' },
    ];

    const requestHandler = (req: { url: string }) => {
      if (req.url.includes('/data/file')) {
        // Get files for the submission
        return Promise.resolve({ content: { data: files } });
      } else if (req.url.includes('/data/submission')) {
        return Promise.resolve({ content: { data: [] } });
      }
      return Promise.reject();
    };

    const storeRequestFake = Sinon.replace(store, 'request', Sinon.fake(requestHandler));
    const storeDestroyFake = Sinon.replace(store, 'destroyRecord', Sinon.fake.resolves());
    this.owner.register('service:store', store);

    try {
      await service.deleteSubmission(submission);

      assert.equal(storeRequestFake.callCount, 2, 'Store request should be called twice');
      // destroyRecord called for: file1, file2, submission, publication = 4 times
      assert.equal(
        storeDestroyFake.callCount,
        4,
        'Store destroyRecord should be called 4 times (2 files + submission + publication)',
      );
      // Verify each object was destroyed
      assert.ok(storeDestroyFake.calledWith(submission), 'Submission should be destroyed');
      assert.ok(storeDestroyFake.calledWith(publication), 'Publication should be destroyed');
      assert.ok(
        files.every((f) => storeDestroyFake.calledWith(f)),
        'All files should be destroyed',
      );
    } finally {
      fetchStub.restore();
      document.cookie = `XSRF-TOKEN=; expires=${new Date(0).toUTCString()}`;
      if (originalCookie) {
        document.cookie = originalCookie;
      }
    }
  });
});
