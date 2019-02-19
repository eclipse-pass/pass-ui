import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow metadata', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let repositories = Ember.Object.create({});
    this.set('submission', submission);
    this.set('repositories', repositories);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});
    // this.set('metadataForms', [Ember.Object.create()]);

    this.render(hbs`{{workflow-metadata
      submission=submission
      repositories=repositories
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    assert.ok(true);
  });
});
