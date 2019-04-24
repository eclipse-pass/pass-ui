import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | workflow repositories', (hooks) => {
  setupRenderingTest(hooks);

  // test('it renders', function (assert) {
  //   let submission = Ember.Object.create({
  //     repositories: [
  //     ],
  //     grants: [
  //       Ember.Object.create({
  //         primaryFunder: Ember.Object.create({
  //           policy: Ember.Object.create({
  //             repositories: []
  //           })
  //         })
  //       }),
  //     ]
  //   });
  //   let repositories = [];

  //   this.set('repositories', repositories);
  //   this.set('submission', submission);
  //   this.set('loadPrevious', (actual) => {});
  //   this.set('loadNext', (actual) => {});

  //   this.render(hbs`{{workflow-repositories
  //     submission=submission
  //     repositories=repositories
  //     next=(action loadNext)
  //     back=(action loadPrevious)}}`);
  //   assert.ok(true);
  // });

  test('it renders', async function (assert) {
    const submission = Ember.Object.create();
    const req = Ember.A();
    const opt = Ember.A();
    const choice = Ember.A();

    this.set('submission', submission);
    this.set('requiredRepositories', req);
    this.set('optionalRepositories', opt);
    this.set('choiceRepositories', choice);

    await render(hbs`{{workflow-repositories
      submission=submission
      requiredRepositories=requiredRepositories
      optionalRepositories=optionalRepositories
      choiceRepositories=choiceRepositories}}`);
    assert.ok(true);
  });
});
