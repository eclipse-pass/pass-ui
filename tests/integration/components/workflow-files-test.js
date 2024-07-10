/* eslint-disable ember/no-classic-classes */
import { selectFiles } from 'ember-file-upload/test-support';
import { set } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, render, waitFor } from '@ember/test-helpers';
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

    this.updateAllFiles = (files) => {
      files.forEach((file) => {
        file.submission = this.submission;
      });
    };

    this.updatePreviouslyUploadedFiles = (files) => {
      this.previouslyUploadedFiles = [...files];
    };

    this.updateNewFiles = (files) => {
      set(this, 'newFiles', [...files]);
    };

    const staticConfig = this.owner.lookup('service:app-static-config');
    sinon.replace(
      staticConfig,
      'getStaticConfig',
      sinon.fake.returns(Promise.resolve({ branding: { stylesheet: '', returns: {} } })),
    );

    this.owner.register('service:app-static-config', staticConfig);

    this.owner.register(
      'service:workflow',
      sinon.stub(this.owner.lookup('service:workflow'), 'getDoiInfo').returns({ DOI: 'moo-doi' }),
    );

    this.msServiceFake = sinon.replace(
      this.owner.lookup('service:oa-manuscript-service'),
      'lookup',
      sinon.fake.returns(Promise.resolve([{ name: 'This is a moo', url: 'http://example.com/moo.pdf' }])),
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
    const store = this.owner.lookup('service:store');
    const submission = store.createRecord('submission');

    const deleteStub = sinon.stub().returns(Promise.resolve());
    const file = store.createRecord('file', {
      name: 'File-for-test',
      fileRole: 'manuscript',
      submission,
    });

    (file.destroyRecord = deleteStub), (this.previouslyUploadedFiles = [file]);
    this.newFiles = [];

    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
  @newFiles={{this.newFiles}}
  @updatePreviouslyUploadedFiles={{this.updatePreviouslyUploadedFiles}}
  @updateNewFiles={{this.updateNewFiles}}
  @updateAllFiles={{this.updateAllFiles}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

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

    const ms = this.store.createRecord('file', {
      name: 'This is the first moo',
      fileRole: 'manuscript',
      submission: this.submission,
    });

    this.previouslyUploadedFiles = [ms];

    await render(hbs`<WorkflowFiles
  @submission={{this.submission}}
  @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
  @newFiles={{this.newFiles}}
  @updatePreviouslyUploadedFiles={{this.updatePreviouslyUploadedFiles}}
  @updateNewFiles={{this.updateNewFiles}}
  @updateAllFiles={{this.updateAllFiles}}
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
  @updatePreviouslyUploadedFiles={{this.updatePreviouslyUploadedFiles}}
  @updateNewFiles={{this.updateNewFiles}}
  @updateAllFiles={{this.updateAllFiles}}
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
    const submission = store.createRecord('submission');

    const file = store.createRecord('file', {
      name: 'File-for-test',
      fileRole: 'manuscript',
      submission,
    });
    file.destroyRecord = () => Promise.reject();

    this.previouslyUploadedFiles = [file];

    // Need to make sure the flash message service is initialized
    this.flashMessages = this.owner.lookup('service:flash-messages');

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
  @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
  @newFiles={{this.newFiles}}
  @updatePreviouslyUploadedFiles={{this.updatePreviouslyUploadedFiles}}
  @updateNewFiles={{this.updateNewFiles}}
  @updateAllFiles={{this.updateAllFiles}}
  @next={{this.fakeAction}}
  @back={{this.fakeAction}}
  @abort={{this.fakeAction}}
/>`);

    const btn = this.element.querySelector('button');
    assert.ok(btn);
    assert.ok(btn.textContent.includes('Remove'));

    await click(btn);

    const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
    assert.ok(sweetAlertBtn);
    await click(sweetAlertBtn);

    // Make sure the Flash Message error message appears in the UI
    await waitFor('.flash-message.alert-danger');
    assert.dom('.flash-message.alert-danger').includesText('We encountered an error when removing this file');
    // Make sure the file row hasn't been removed
    assert.dom('[data-test-added-manuscript-row]').exists();
    assert.dom('[data-test-added-manuscript-row]').includesText('File-for-test');
  });
});
