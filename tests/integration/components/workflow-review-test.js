/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, ember/no-get */
import { A } from '@ember/array';
import EmberObject, { get } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, render, waitUntil, waitFor } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | workflow review', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.post('https://pass.local/schemaservice?merge=true', (_schema, _request) => true);

    const typesUsed = ['info'];
    this.owner.lookup('service:flash-messages').registerTypes(typesUsed);
  });

  test('it renders', async function (assert) {
    let submission = EmberObject.create({
      metadata: '[]',
      repositories: [],
    });
    let publication = EmberObject.create({});
    let files = [EmberObject.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {});
    this.set('loadPrevious', (actual) => {});
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`
      <WorkflowReview
        @submission={{this.submission}}
        @publication={{this.publication}}
        @previouslyUploadedFiles={{this.files}}
        @comment={{this.comment}}
        @back={{action this.loadPrevious}}
        @submit={{action this.submit}}
        @uploading={{this.uploading}}
        @waitingMessage={{this.waitingMessage}}
      />
    `);
    assert.ok(true);
  });

  test('preparation success: no web-link click and no agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = EmberObject.create({
      id: 'test:repo1',
      integrationType: 'full',
      agreementText: 'Cows are the best',
      name: 'repo1',
    });
    let repo2 = EmberObject.create({ id: 'test:repo2', integrationType: 'web-link', name: 'repo2' });
    let submitted = false;

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'preparer' },
      })
    );

    let submission = EmberObject.create({
      submitter: {
        id: 'pi',
      },
      preparers: A([get(this, 'currentUser.user')]),
      repositories: A([repo1, repo2]),
      metadata: '[]',
    });

    let publication = EmberObject.create({});
    let files = [EmberObject.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {
      submitted = true;
    });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`
      <WorkflowReview
        @submission={{this.submission}}
        @publication={{this.publication}}
        @previouslyUploadedFiles={{this.files}}
        @comment={{this.comment}}
        @submit={{action this.submit}}
        @uploading={{this.uploading}}
        @waitingMessage={{this.waitingMessage}}
      />
    `);

    // Click on submit
    await click('.submit');

    assert.true(submitted);

    // Both repositories present
    assert.strictEqual(submission.get('repositories.length'), 2);
  });

  test('submission success: web-link and agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = EmberObject.create({
      id: 'test:repo1',
      integrationType: 'full',
      agreementText: 'Cows are the best',
      name: 'repo1',
      _isWebLink: false,
    });
    let repo2 = EmberObject.create({
      id: 'test:repo2',
      integrationType: 'web-link',
      url: '',
      name: 'repo2',
      _isWebLink: true,
    });
    let submitted = false;

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'pi' },
      })
    );

    let submission = EmberObject.create({
      submitter: {
        id: 'pi',
      },
      preparers: A([get(this, 'currentUser.user')]),
      repositories: A([repo1, repo2]),
      metadata: '[]',
    });

    let publication = EmberObject.create({});
    let files = [EmberObject.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {
      submitted = true;
    });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`
      <WorkflowReview
        @submission={{this.submission}}
        @publication={{this.publication}}
        @previouslyUploadedFiles={{this.files}}
        @comment={{this.comment}}
        @submit={{action this.submit}}
        @uploading={{this.uploading}}
        @waitingMessage={{this.waitingMessage}}
      />
    `);

    // Click on web-link repository and then confirm
    await click('[data-test-repo-link-button]');
    await click(document.querySelector('.swal2-confirm'));

    // Click on submit
    await click('.submit');

    // Click on deposit agreement checkbox and then next
    await waitFor(document.querySelector('.swal2-radio label:nth-child(1) input[type="radio"]'));
    await click(document.querySelector('.swal2-radio label:nth-child(1) input[type="radio"]'));
    await click(document.querySelector('.swal2-confirm'));

    // Click on confirm submission
    await click(document.querySelector('.swal2-confirm'));

    assert.true(submitted);

    // Submission to full repo and web-link repo
    assert.strictEqual(submission.get('repositories.length'), 2);
    assert.strictEqual(submission.get('repositories.firstObject.id'), repo1.id);
  });

  test('submission failure: no web-link click', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo2 = EmberObject.create({
      id: 'test:repo2',
      integrationType: 'web-link',
      name: 'repo2',
      _isWebLink: true,
    });
    let submitted = false;

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'pi' },
      })
    );

    let submission = EmberObject.create({
      submitter: {
        id: 'pi',
      },
      preparers: A([get(this, 'currentUser.user')]),
      repositories: A([repo2]),
      metadata: '[]',
    });

    let publication = EmberObject.create({});
    let files = [EmberObject.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {
      submitted = true;
    });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`
      <WorkflowReview
        @submission={{this.submission}}
        @publication={{this.publication}}
        @previouslyUploadedFiles={{this.files}}
        @comment={{this.comment}}
        @submit={{action this.submit}}
        @uploading={{this.uploading}}
        @waitingMessage={{this.waitingMessage}}
      />
    `);

    // Click on submit
    await click('.submit');

    await waitUntil(() => !document.querySelector('.swal2-title'), { timeout: 500 });

    await waitFor('.flash-message.alert.alert-warning');
    assert
      .dom('.flash-message.alert.alert-warning')
      .includesText(
        'Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.'
      );

    assert.strictEqual(document.querySelector('.swal2-title'), null);

    assert.false(submitted);
  });

  test('submission failure: no repository agreement', async function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/review');
    assert.ok(controller);

    let repo1 = EmberObject.create({
      id: 'test:repo1',
      integrationType: 'full',
      agreementText: 'Cows are the best',
      name: 'repo1',
    });
    let submitted = false;

    this.owner.register(
      'service:current-user',
      EmberObject.extend({
        user: { id: 'pi' },
      })
    );

    let submission = EmberObject.create({
      submitter: {
        id: 'pi',
      },
      preparers: A([get(this, 'currentUser.user')]),
      repositories: A([repo1]),
      metadata: '[]',
    });

    let publication = EmberObject.create({});
    let files = [EmberObject.create({})];

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submit', (actual) => {
      submitted = true;
    });
    this.set('files', files);
    this.set('comment', '');
    this.set('uploading', '');
    this.set('waitingMessage', '');

    await render(hbs`
      <WorkflowReview
        @submission={{this.submission}}
        @publication={{this.publication}}
        @previouslyUploadedFiles={{this.files}}
        @comment={{this.comment}}
        @submit={{action this.submit}}
        @uploading={{this.uploading}}
        @waitingMessage={{this.waitingMessage}}
      />
    `);

    await click('.submit');

    // Click the second radio indicating submit without agreeing to deposit agreement
    await waitFor(document.querySelector('.swal2-radio label:nth-child(2) input[type="radio"]'));
    await click(document.querySelector('.swal2-radio label:nth-child(2) input[type="radio"]'));

    // Click Next without agreeing
    await click(document.querySelector('.swal2-confirm'));

    // Should be warning about no deposit agreement
    assert.strictEqual(document.querySelector('.swal2-title').textContent, 'Your submission cannot be submitted.');
    assert.true(document.querySelector('.swal2-content').textContent.includes(repo1.get('name')));

    await click(document.querySelector('.swal2-confirm'));

    assert.false(submitted);
  });
});
