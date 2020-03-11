import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow policies', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = EmberObject.create({
      repositories: [],
      grants: []
    });
    let policies = [];
    let publication = EmberObject.create({});

    this.set('submission', submission);
    this.set('policies', policies);
    this.set('publication', publication);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    this.render(hbs`{{workflow-policies
      submission=submission
      policies=policies
      publication=publication
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    assert.ok(true);
  });
});
