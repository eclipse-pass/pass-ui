/* eslint-disable ember/no-classic-classes */
import { selectFiles } from 'ember-file-upload/test-support';
import Service from '@ember/service';
import { A } from '@ember/array';
import EmberObject, { set } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { click, render, triggerEvent, waitFor, getContext } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | workflow files', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    let submission = EmberObject.create({
      repositories: [],
      grants: [],
    });
    let files = [EmberObject.create({})];
    let newFiles = A([]);
    set(this, 'submission', submission);
    set(this, 'files', files);
    set(this, 'newFiles', newFiles);
    set(this, 'loadPrevious', (actual) => {});
    set(this, 'loadNext', (actual) => {});

    const mockStaticConfig = Service.extend({
      getStaticConfig: () =>
        Promise.resolve({
          branding: {
            stylesheet: '',
            pages: {},
          },
        }),
      addCss: () => {},
    });

    this.owner.register('service:app-static-config', mockStaticConfig);

    this.owner.register(
      'service:workflow',
      Service.extend({
        getDoiInfo: () => ({ DOI: 'moo-doi' }),
      })
    );

    this.owner.register(
      'service:oa-manuscript-service',
      Service.extend({
        lookup: () =>
          Promise.resolve([
            {
              name: 'This is a moo',
              url: 'http://example.com/moo.pdf',
            },
          ]),
      })
    );

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
  test('Files removed from UI should no longer reference submission', async function (assert) {
    assert.expect(5);

    const submission = EmberObject.create({});
    this.set('submission', submission);

    this.set(
      'previouslyUploadedFiles',
      A([
        EmberObject.create({
          name: 'File-for-test',
          fileRole: 'manuscript',
          submission,
          // TODO: bring this back when file service is implemented
          // save() {
          //   // Should be called when "deleted" to persist changes
          //   assert.ok(true);
          //   return Promise.resolve();
          // },
          unloadRecord() {
            assert.ok(true);
            return Promise.resolve();
          },
        }),
      ])
    );

    // Bogus action so component actions don't complain
    this.set('moo', () => {});

    await render(hbs`
      <WorkflowFiles
        @submission={{this.submission}}
        @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
        @next={{action this.moo}}
        @back={{action this.moo}}
        @abort={{action this.moo}}
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
  });

  /**
   * When a manuscript is already attached to the submission, FoundManuscripts component
   * should not appear.
   *
   * User should still be able to manually upload supplemental files
   */
  test("Can't select oa mss when manuscript already attached to submission", async function (assert) {
    this.store = this.owner.lookup('service:store');
    const submission = this.store.createRecord('submission');

    const ms = EmberObject.create({
      name: 'This is the first moo',
      fileRole: 'manuscript',
    });

    set(this, 'submission', submission);
    set(this, 'previouslyUploadedFiles', A([ms]));
    set(this, 'moo', () => {});

    this.owner.register(
      'service:submission-handler',
      Service.extend({
        uploadFile(submission, file) {
          assert.ok(submission, 'No submission found');
          assert.ok(file, 'No file specified for upload');
        },
      })
    );

    await render(hbs`<WorkflowFiles
      @submission={{this.submission}}
      @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
      @newFiles={{this.newFiles}}
      @next={{this.moo}}
      @back={{this.moo}}
      @abort={{this.moo}}
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
    this.store = this.owner.lookup('service:store');
    const submission = this.store.createRecord('submission');

    set(this, 'moo', () => {});
    set(this, 'submission', submission);
    set(this, 'previouslyUploadedFiles', A([]));

    this.owner.register(
      'service:submission-handler',
      Service.extend({
        uploadFile(submission, file) {
          assert.ok(submission, 'No submission found');
          assert.ok(file, 'No file specified for upload');
        },
      })
    );

    await render(hbs`<WorkflowFiles
      @submission={{this.submission}}
      @previouslyUploadedFiles={{this.previouslyUploadedFiles}}
      @newFiles={{this.newFiles}}
      @next={{this.moo}}
      @back={{this.moo}}
      @abort={{this.moo}}
    />`);

    assert.dom('[data-test-added-manuscript-row]').doesNotExist();
    assert.dom('#file-multiple-input').exists();

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-manuscript-row]').exists();
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');
  });
});
