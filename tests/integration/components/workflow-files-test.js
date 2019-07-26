import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | workflow files', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let files = [Ember.Object.create({})];
    let newFiles = Ember.A();
    this.set('submission', submission);
    this.set('files', files);
    this.set('newFiles', newFiles);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});
  });

  /**
   * Intent is to fake the file input element to make it look like a file is present,
   * then test the behavior of #getFiles().
   *
   * In this case, submission-handler#uploadFiles() should be called once for each
   * mock file
   */
  test('Files should upload immediately', function (assert) {
    assert.expect(6);

    this.owner.register('service:store', Ember.Service.extend({
      createRecord: () => Promise.resolve()
    }));
    this.owner.register('service:submission-handler', Ember.Service.extend({
      uploadFile: (submission, file) => {
        assert.ok(submission);
        assert.ok(file);

        assert.equal(file.get('name'), 'Fake-file-name');
        assert.equal(file.get('mimeType'), 'plain');
        assert.deepEqual(file.get('_file'), { size: 100, name: 'Fake-file-name', type: 'text/plain' });
      }
    }));

    run(() => {
      const component = this.owner.lookup('component:workflow-files');

      // Crappily mock this function on the component so we don't have to mess with
      // the 'document' object...
      component.set('_getFilesElement', () => {
        assert.ok(true);
        return ({
          files: [
            {
              size: 100,
              name: 'Fake-file-name',
              type: 'text/plain'
            }
          ]
        });
      });
      component.set('newFiles', Ember.A());
      component.set('submission', Ember.Object.create());

      component.send('getFiles');
    });
  });

  /**
   * First upload a file, then click the 'Remove' button
   */
  test('Files removed from UI should no longer reference submission', async function (assert) {
    assert.expect(6);

    const submission = Ember.Object.create({});
    this.set('submission', submission);

    this.set('previouslyUploadedFiles', Ember.A([
      Ember.Object.create({
        name: 'File-for-test',
        fileRole: 'manuscript',
        submission,
        save() {
          // Should be called when "deleted" to persist changes
          assert.ok(true);
          return Promise.resolve();
        },
        unloadRecord() {
          assert.ok(true);
          return Promise.resolve();
        }
      })
    ]));

    // Bogus action so component actions don't complain
    this.set('moo', () => {});

    await render(hbs`{{workflow-files
      submission=submission
      previouslyUploadedFiles=previouslyUploadedFiles
      next=(action moo)
      back=(action moo)
      abort=(action moo)}}`);

    const btn = this.element.querySelector('button');
    assert.ok(btn);
    assert.ok(btn.textContent.includes('Remove'));

    await click(btn);

    const sweetAlertBtn = document.querySelector('.swal2-container button.swal2-confirm');
    assert.ok(sweetAlertBtn);
    await click(sweetAlertBtn);

    const workflowFiles = this.get('previouslyUploadedFiles');
    assert.equal(workflowFiles.length, 0, 'Should have 0 files tracked');
  });
});
