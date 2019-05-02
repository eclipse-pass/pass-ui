import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow repositories', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = Ember.Object.create({
      repositories: [
      ],
      grants: [
        Ember.Object.create({
          primaryFunder: Ember.Object.create({
            policy: Ember.Object.create({
              repositories: []
            })
          })
        }),
      ]
    });
    let repositories = [];

    this.set('repositories', repositories);
    this.set('submission', submission);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    this.render(hbs`{{workflow-repositories
      submission=submission
      repositories=repositories
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    assert.ok(true);
  });
});
