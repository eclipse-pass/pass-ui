/* eslint-disable ember/no-classic-classes */
import { selectFiles } from 'ember-file-upload/test-support';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';

module('Integration | Component | workflow files', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    this.submission = store.createRecord('submission', {
      repositoriers: [],
      grants: [],
    });
    this.files = [{}];
    this.newFiles = [];

    this.loadPrevious = sinon.fake();
    this.loadNext = sinon.fake();

    // Bogus action so component actions don't complain
    this.fakeAction = sinon.fake();

    const staticConfig = this.owner.lookup('service:app-static-config');
    sinon.replace(
      staticConfig,
      'getStaticConfig',
      sinon.fake.returns(Promise.resolve({ branding: { stylesheet: '', returns: {} } }))
    );

    this.owner.register('service:app-static-config', staticConfig);

    this.owner.register(
      'service:workflow',
      sinon.stub(this.owner.lookup('service:workflow'), 'getDoiInfo').returns({ DOI: 'moo-doi' })
    );

    this.msServiceFake = sinon.replace(
      this.owner.lookup('service:oa-manuscript-service'),
      'lookup',
      sinon.fake.returns(Promise.resolve([{ name: 'This is a moo', url: 'http://example.com/moo.pdf' }]))
    );
    this.owner.register('service:oa-manuscript-service', this.msServiceFake);

    // Inline configure mirage to respond to File saves
    this.server.post(
      '/api/v1/file',
      () =>
        new Response(201, {
          Location: 'https://pass.local/api/v1/file/123456',
          'Content-Type': 'text/plain; charset=UTF-8',
        })
    );
  });

  /**
   * First upload a file, then click the 'Remove' button
   */
  test("Files removed from UI should call the file's `destroyRecord`", async function (assert) {
    const submission = EmberObject.create({});

    const deleteStub = sinon.stub().returns(Promise.resolve());
    const file = {
      name: 'File-for-test',
      fileRole: 'manuscript',
      submission,
      destroyRecord: deleteStub,
    };

    this.previouslyUploadedFiles = [file];
    this.newFiles = [];

    await render(hbs`
      <WorkflowFiles
        @submission={{this.submission}}
        @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
        @newFiles={{this.newFiles}}
        @next={{action this.fakeAction}}
        @back={{action this.fakeAction}}
        @abort={{action this.fakeAction}}
      />
    `);

    const btn = this.element.querySelector('button');
    assert.ok(btn);
    assert.ok(btn.textContent.includes('Remove'));

    await click(btn);

    const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
    assert.ok(sweetAlertBtn);
    await click(sweetAlertBtn);

    const workflowFiles = this.previouslyUploadedFiles;
    assert.strictEqual(workflowFiles.length, 0, 'Should have 0 files tracked');

    assert.ok(deleteStub.calledOnce, 'File destroyRecord() should be called');
  });

  /**
   * When a manuscript is already attached to the submission, FoundManuscripts component
   * should not appear.
   *
   * User should still be able to manually upload supplemental files
   */
  test("Can't select oa mss when manuscript already attached to submission", async function (assert) {
    this.store = this.owner.lookup('service:store');
    this.submission = this.store.createRecord('submission');

    const ms = {
      name: 'This is the first moo',
      fileRole: 'manuscript',
    };

    this.previouslyUploadedFiles = [ms];

    await render(hbs`<WorkflowFiles
      @submission={{this.submission}}
      @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
      @newFiles={{this.newFiles}}
      @next={{this.fakeAction}}
      @back={{this.fakeAction}}
      @abort={{this.fakeAction}}
    />`);

    assert.dom('[data-test-foundmss-component]').doesNotExist();
    assert.dom('[data-test-added-supplemental-row]').doesNotExist();
    assert.dom('#file-multiple-input').exists();

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-supplemental-row]').exists();
    assert.dom('[data-test-added-supplemental-row]').includesText('my-submission.pdf');
  });

  test('Manually uploading a MS should hide FoundManuscript component', async function (assert) {
    this.previouslyUploadedFiles = [];

    await render(hbs`<WorkflowFiles
      @submission={{this.submission}}
      @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
      @newFiles={{this.newFiles}}
      @next={{this.fakeAction}}
      @back={{this.fakeAction}}
      @abort={{this.fakeAction}}
    />`);

    assert.ok(this.msServiceFake.calledOnce, 'Manuscript Service should be called once');
    assert.dom('[data-test-added-manuscript-row]').doesNotExist();
    assert.dom('#file-multiple-input').exists();

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-manuscript-row]').exists({ count: 1 });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');
  });

  test('Destroy record error displays error message', async function (assert) {
    const store = this.owner.lookup('service:store');

    const file = store.createRecord('file', {
      name: 'File-for-test',
      fileRole: 'manuscript',
    });
    file.destroyRecord = () => Promise.reject();

    this.previouslyUploadedFiles = [file];

    const flashMessages = this.owner.lookup('service:flash-messages');
    const flashMessagesFake = sinon.replace(flashMessages, 'danger', sinon.fake());
    this.flashMessages = flashMessages;

    await render(hbs`
      <WorkflowFiles
        @submission={{this.submission}}
        @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
        @newFiles={{this.newFiles}}
        @next={{action this.fakeAction}}
        @back={{action this.fakeAction}}
        @abort={{action this.fakeAction}}
      />
    `);

    const btn = this.element.querySelector('button');
    assert.ok(btn);
    assert.ok(btn.textContent.includes('Remove'));

    await click(btn);

    const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
    assert.ok(sweetAlertBtn);
    await click(sweetAlertBtn);

    assert.ok(flashMessagesFake.calledOnce, 'Flash message error should be called');
  });
});
