import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';

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

  test('preparation success: no web-link click and no agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = Ember.Object.create({
      id: 'test:repo1', integrationType: 'full', agreementText: 'Cows are the best', name: 'repo1'
    });
    let repo2 = Ember.Object.create({ id: 'test:repo2', integrationType: 'web-link', name: 'repo2' });
    let submitted = false;

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'preparer' }
    }));

    let submission = Ember.Object.create({
      submitter: {
        id: 'pi'
      },
      preparers: Ember.A([this.get('currentUser.user')]),
      repositories: Ember.A([repo1, repo2]),
      metadata: '[]'
    });

    let publication = Ember.Object.create({});
    let files = [Ember.Object.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => { submitted = true; });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`{{workflow-review
      submission=submission
      publication=publication
      previouslyUploadedFiles=files
      comment=comment
      submit=(action submit)
      uploading=uploading
      waitingMessage=waitingMessage}}`);

    // Click on submit
    await click('.submit');

    assert.equal(submitted, true);

    // Both repositories present
    assert.equal(submission.get('repositories.length'), 2);
  });

  test('submission success: web-link and agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = Ember.Object.create({
      id: 'test:repo1',
      integrationType: 'full',
      agreementText: 'Cows are the best',
      name: 'repo1',
      _isWebLink: false
    });
    let repo2 = Ember.Object.create({
      id: 'test:repo2',
      integrationType: 'web-link',
      url: '',
      name: 'repo2',
      _isWebLink: true
    });
    let submitted = false;

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'pi' }
    }));

    let submission = Ember.Object.create({
      submitter: {
        id: 'pi'
      },
      preparers: Ember.A([this.get('currentUser.user')]),
      repositories: Ember.A([repo1, repo2]),
      metadata: '[]'
    });

    let publication = Ember.Object.create({});
    let files = [Ember.Object.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => { submitted = true; });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`{{workflow-review
      submission=submission
      publication=publication
      previouslyUploadedFiles=files
      comment=comment
      submit=(action submit)
      uploading=uploading
      waitingMessage=waitingMessage}}`);

    // Click on web-link repository and then confirm
    await click('.btn-link');
    await click('.swal2-confirm');

    // Click on submit
    await click('.submit');

    // Click on deposit agreement checkbox and then next
    await click('.swal2-checkbox');
    await click('.swal2-confirm');

    // Click on confirm submission
    await click('.swal2-confirm');

    assert.equal(submitted, true);

    // Submission to full repo only
    assert.equal(submission.get('repositories.length'), 1);
    assert.equal(submission.get('repositories.firstObject.id'), repo1.id);
  });

  test('submission failure: no web-link click', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo2 = Ember.Object.create({
      id: 'test:repo2',
      integrationType: 'web-link',
      name: 'repo2',
      _isWebLink: true
    });
    let submitted = false;

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'pi' }
    }));

    let submission = Ember.Object.create({
      submitter: {
        id: 'pi'
      },
      preparers: Ember.A([this.get('currentUser.user')]),
      repositories: Ember.A([repo2]),
      metadata: '[]'
    });

    let publication = Ember.Object.create({});
    let files = [Ember.Object.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => { submitted = true; });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`{{workflow-review
      submission=submission
      publication=publication
      previouslyUploadedFiles=files
      comment=comment
      submit=(action submit)
      uploading=uploading
      waitingMessage=waitingMessage}}`);

    // Click on submit
    await click('.submit');

    // Should be toastr warning about web-link click instead of confirm dialog
    assert.equal(document.querySelector('.swal2-title'), null);

    assert.equal(submitted, false);
  });

  test('submission failure: no repository agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = Ember.Object.create({
      id: 'test:repo1', integrationType: 'full', agreementText: 'Cows are the best', name: 'repo1'
    });
    let submitted = false;

    this.owner.register('service:current-user', Ember.Object.extend({
      user: { id: 'pi' }
    }));

    let submission = Ember.Object.create({
      submitter: {
        id: 'pi'
      },
      preparers: Ember.A([this.get('currentUser.user')]),
      repositories: Ember.A([repo1]),
      metadata: '[]'
    });

    let publication = Ember.Object.create({});
    let files = [Ember.Object.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => { submitted = true; });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`{{workflow-review
      submission=submission
      publication=publication
      previouslyUploadedFiles=files
      comment=comment
      submit=(action submit)
      uploading=uploading
      waitingMessage=waitingMessage}}`);

    await click('.submit');

    // Click Next without agreeing
    await click('.swal2-confirm');

    // Should be warning about no deposit agreement
    assert.equal(document.querySelector('.swal2-title').textContent, 'Your submission cannot be submitted.');
    assert.equal(document.querySelector('.swal2-content').textContent.includes(repo1.get('name')), true);

    await click('.swal2-confirm');

    assert.equal(submitted, false);
  });
});
