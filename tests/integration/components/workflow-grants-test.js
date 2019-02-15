import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow grants', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let preLoadedGrant = Ember.Object.create({});
    this.set('submission', submission);
    this.set('preLoadedGrant', preLoadedGrant);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    this.render(hbs`{{workflow-grants
      submission=submission
      preLoadedGrant=preLoadedGrant
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    assert.ok(true);
  });
});
