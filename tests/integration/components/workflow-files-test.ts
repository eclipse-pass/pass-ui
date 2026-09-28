import { selectFiles } from 'ember-file-upload/test-support';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import { Response } from 'miragejs';
// @ts-expect-error no declaration file for sinon
import sinon from 'sinon';
import type AppStore from 'pass-ui/services/store';
import type Workflow from 'pass-ui/services/workflow';
import type { WorkflowFile } from 'pass-ui/services/workflow';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

module('Integration | Component | workflow files', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store') as AppStore;
    this.submission = store.createRecord('submission', {
      repositoriers: [],
      grants: [],
    });

    // Bogus action so component actions don't complain
    this.fakeAction = sinon.fake();

    const staticConfig = this.owner.lookup('service:app-static-config') as AppStaticConfigService;
    sinon.replace(
      staticConfig,
      'getStaticConfig',
      sinon.fake.returns(Promise.resolve({ branding: { stylesheet: '', returns: {} } })),
    );

    this.owner.register('service:app-static-config', staticConfig);

    this.msServiceFake = sinon.replace(
      this.owner.lookup('service:oa-manuscript-service') as object,
      'lookup',
      sinon.fake.returns(Promise.resolve([{ name: 'This is a moo', url: 'https://example.com/moo.pdf' }])),
    );
    this.owner.register('service:oa-manuscript-service', this.msServiceFake);

    // Inline configure mirage to respond to File saves
    this.server.post(
      '/api/v1/file',
      () =>
        new Response(201, {
          Location: 'https://pass.local/api/v1/file/123456',
          'Content-Type': 'text/plain; charset=UTF-8',
        }),
    );
  });

  /**
   * First upload a file, then click the 'Remove' button
   */

  test("Files removed from UI should call the file's `destroyRecord`", async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const submission = store.createRecord('submission', {});

    const file = store.createRecord('file', {
      name: 'File-for-test',
      fileRole: 'manuscript',
      submission,
      uri: '/file/test-uuid/File-for-test',
    });

    // deleteFileWithBytes calls fetch() then store.destroyRecord()
    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves(new globalThis.Response(null, { status: 200 }));
    const destroyStub = sinon.stub(store, 'destroyRecord').returns(Promise.resolve());

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file as unknown as WorkflowFile]);

    try {
      await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

      const btn = this.element.querySelector('button');
      assert.ok(btn);
      assert.ok(btn!.textContent!.includes('Remove'));

      await click(btn!);

      const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
      assert.ok(sweetAlertBtn);
      await click(sweetAlertBtn!);

      const workflowFiles = workflow.getFiles();
      assert.strictEqual(workflowFiles.length, 0, 'Should have 0 files tracked');
      assert.ok(destroyStub.calledOnce, 'store.destroyRecord() should be called');
    } finally {
      fetchStub.restore();
    }
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

    const ms = this.store.createRecord('file', {
      name: 'This is the first moo',
      fileRole: 'manuscript',
      submission: this.submission,
    });

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([ms as unknown as WorkflowFile]);

    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

    assert.dom('[data-test-foundmss-component]').doesNotExist();
    assert.dom('[data-test-added-supplemental-row]').doesNotExist();
    assert.dom('#file-multiple-input').exists();

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });

    Object.defineProperty(submissionFile, 'name', { value: 'my-submission.pdf' });
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-supplemental-row]').exists();
    assert.dom('[data-test-added-supplemental-row]').includesText('my-submission.pdf');
  });

  test('Manually uploading a MS should hide FoundManuscript component', async function (assert) {
    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
  @doi='test'
/>`);

    assert.ok(this.msServiceFake.calledOnce, 'Manuscript Service should be called once');
    assert.dom('[data-test-added-manuscript-row]').doesNotExist();
    assert.dom('#file-multiple-input').exists();

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });

    Object.defineProperty(submissionFile, 'name', { value: 'my-submission.pdf' });
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-manuscript-row]').exists({ count: 1 });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');
  });

  test('Destroy record error displays error message', async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const submission = store.createRecord('submission', {});

    const file = store.createRecord('file', {
      name: 'File-for-test',
      fileRole: 'manuscript',
      submission,
      uri: '/file/test-uuid/File-for-test',
    });

    // deleteFileWithBytes calls fetch() then store.destroyRecord() — make destroyRecord fail
    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves(new globalThis.Response(null, { status: 200 }));
    sinon.stub(store, 'destroyRecord').rejects(new Error('destroy failed'));

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file as unknown as WorkflowFile]);

    // Need to make sure the flash message service is initialized
    this.flashMessages = this.owner.lookup('service:flash-messages');

    try {
      await render(hbs`{{#each this.flashMessages.queue as |flash|}}
  <div class='flash-message-container'>
    <FlashMessage @flash={{flash}} as |component flash close|>
      <div class='d-flex justify-content-between'>
        {{flash.message}}
        <span role='button' {{on 'click' close}}>
          x
        </span>
      </div>
    </FlashMessage>
  </div>
{{/each}}
<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

      const btn = this.element.querySelector('button');
      assert.ok(btn);
      assert.ok(btn!.textContent!.includes('Remove'));

      await click(btn!);

      const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
      assert.ok(sweetAlertBtn);
      await click(sweetAlertBtn!);

      // Make sure the Flash Message error message appears in the UI
      await waitFor('.flash-message.alert-danger');
      assert.dom('.flash-message.alert-danger').includesText('We encountered an error when removing this file');
      // Make sure the file row hasn't been removed
      assert.dom('[data-test-added-manuscript-row]').exists();
      assert.dom('[data-test-added-manuscript-row]').includesText('File-for-test');
    } finally {
      fetchStub.restore();
    }
  });

  test('Uploading a file moves focus to the newly added file description input', async function (assert) {
    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

    const submissionFile = new Blob(['content'], { type: 'application/pdf' });
    Object.defineProperty(submissionFile, 'name', { value: 'focus-test-file.pdf' });

    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-manuscript-row]').exists();
    assert.dom('[data-test-file-description-input]').isFocused();
    assert.dom('[aria-live="polite"]').includesText('uploaded successfully.');
  });

  test('Removing a file when others exist moves focus to adjacent file remove button', async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const file1 = store.createRecord('file', {
      id: 'file-1',
      name: 'First-file.pdf',
      fileRole: 'manuscript',
      submission: this.submission,
      uri: '/file/uuid1/First-file.pdf',
    });
    const file2 = store.createRecord('file', {
      id: 'file-2',
      name: 'Second-file.pdf',
      fileRole: 'supplemental',
      submission: this.submission,
      uri: '/file/uuid2/Second-file.pdf',
    });

    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves(new globalThis.Response(null, { status: 200 }));
    sinon.stub(store, 'destroyRecord').returns(Promise.resolve());

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file1 as unknown as WorkflowFile, file2 as unknown as WorkflowFile]);

    try {
      await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

      await click('#file-remove-file-1');

      const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
      assert.ok(sweetAlertBtn);
      await click(sweetAlertBtn!);

      assert.dom('#file-remove-file-2').isFocused();
      assert.dom('[aria-live="polite"]').hasText('First-file.pdf removed.');
    } finally {
      fetchStub.restore();
    }
  });

  test('Removing the only file moves focus to file upload input', async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const file1 = store.createRecord('file', {
      id: 'file-only',
      name: 'Only-file.pdf',
      fileRole: 'manuscript',
      submission: this.submission,
      uri: '/file/uuid-only/Only-file.pdf',
    });

    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves(new globalThis.Response(null, { status: 200 }));
    sinon.stub(store, 'destroyRecord').returns(Promise.resolve());

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file1 as unknown as WorkflowFile]);

    try {
      await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

      await click('#file-remove-file-only');

      const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
      assert.ok(sweetAlertBtn);
      await click(sweetAlertBtn!);

      assert.dom('#file-multiple-input').isFocused();
      assert.dom('[aria-live="polite"]').hasText('Only-file.pdf removed.');
    } finally {
      fetchStub.restore();
    }
  });

  test('Cancelling file removal restores focus to the Remove button', async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const file1 = store.createRecord('file', {
      id: 'file-keep',
      name: 'Keep-file.pdf',
      fileRole: 'manuscript',
      submission: this.submission,
      uri: '/file/uuid-keep/Keep-file.pdf',
    });

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file1 as unknown as WorkflowFile]);

    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

    await click('#file-remove-file-keep');

    const cancelBtn = document.querySelector('.swal2-container button.swal2-cancel');
    assert.ok(cancelBtn);
    await click(cancelBtn!);

    assert.dom('#file-remove-file-keep').isFocused();
    assert.dom('[data-test-added-manuscript-row]').exists();
  });

  test('Failed file removal restores focus to the Remove button', async function (assert) {
    const store = this.owner.lookup('service:store') as AppStore;
    const file1 = store.createRecord('file', {
      id: 'file-fail',
      name: 'Fail-file.pdf',
      fileRole: 'manuscript',
      submission: this.submission,
      uri: '/file/uuid-fail/Fail-file.pdf',
    });

    document.cookie = 'XSRF-TOKEN=test-token';
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves(new globalThis.Response(null, { status: 200 }));
    sinon.stub(store, 'destroyRecord').rejects(new Error('destroy failed'));

    const workflow = this.owner.lookup('service:workflow') as Workflow;
    workflow.setFiles([file1 as unknown as WorkflowFile]);

    try {
      await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

      await click('#file-remove-file-fail');

      const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
      assert.ok(sweetAlertBtn);
      await click(sweetAlertBtn!);

      assert.dom('#file-remove-file-fail').isFocused();
      assert.dom('[data-test-added-manuscript-row]').exists();
      assert.dom('[aria-live="polite"]').includesText('error when removing this file');
    } finally {
      fetchStub.restore();
    }
  });
});
