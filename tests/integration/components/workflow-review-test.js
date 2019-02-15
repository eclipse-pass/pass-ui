import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow review', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = Ember.Object.create({
      metadata: '[]',
      repositories: []
    });
    let publication = Ember.Object.create({});
    let files = [Ember.Object.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {});
    this.set('loadPrevious', (actual) => {});
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    this.render(hbs`{{workflow-review
      submission=submission
      publication=publication
      previouslyUploadedFiles=files
      comment=comment
      back=(action loadPrevious)
      submit=(action submit)
      uploading=uploading
      waitingMessage=waitingMessage}}`);
    assert.ok(true);
  });
});
