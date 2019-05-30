import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';

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
});
