import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow files', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
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

    this.render(hbs`{{workflow-files
      submission=submission
      previouslyUploadedFiles=files
      newFiles=newFiles
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    assert.ok(true);
  });
});
