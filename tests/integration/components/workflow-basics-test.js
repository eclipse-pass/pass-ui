import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | workflow basics', (hooks) => {
  setupRenderingTest(hooks);

  // Inject mocked store that on query returns a single user
  hooks.beforeEach(function () {
    let store = Ember.Service.extend({
      query: (type, q) => Promise.resolve([Ember.Object.create({ id: 'bob', username: 'bob', email: 'bob@moo.com' })])
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', store);
      this.store = this.owner.lookup('service:store');
    });
  });

  test('publication title renders', async function (assert) {
    assert.expect(1);

    let model = Ember.Object.create({
      newSubmission: Ember.Object.create({}),
      publication: Ember.Object.create({ title: 'Advanced Bovine Thought' })
    });

    this.set('model', model);

    await render(hbs`{{workflow-basics model=model}}`);

    assert.equal(this.element.querySelector('#title').value, model.publication.title);
  });

  test('choose proxy', async function (assert) {
    assert.expect(6);

    let model = Ember.Object.create({
      newSubmission: Ember.Object.create({ hasNewProxy: false }),
      publication: Ember.Object.create({ title: 'Advanced Bovine Thought' })
    });

    this.set('model', model);
    this.set('isShowingModal', false);
    this.set('users', []);

    await render(hbs`{{workflow-basics model=model isShowingModal=isShowingModal users=users}}`);

    // User chooses to do a proxy submission
    assert.equal(this.get('model.newSubmission.hasNewProxy'), false);
    await click('#on-behalf-of-block input[type="radio"]:not(:checked)');
    assert.equal(this.get('model.newSubmission.hasNewProxy'), true);

    // User search calls mocked Store.query when Search for user button clicked
    await click('#search-for-users');
    assert.equal(this.get('users.length'), 1);
    assert.equal(this.get('isShowingModal'), true);

    // User picks submitter
    await click('.user-search-results div a');
    assert.equal(this.get('model.newSubmission.submitter.id'), 'bob');
    assert.equal(this.get('isShowingModal'), false);
  });
});
