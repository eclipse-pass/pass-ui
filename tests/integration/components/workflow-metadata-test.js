/* eslint-disable ember/no-classic-classes, ember/no-get */
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import { getContext, click, render, fillIn, waitFor, waitUntil, find, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import sinon from 'sinon';

module('Integration | Component | workflow-metadata', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const metadata = {
    abstract: 'this is an abtract',
    authors: [{ author: 'Bob Bobson', orcid: '1234' }],
    'Embargo-end-date': '2021-01-01',
    issue: '3',
    issns: [{ issn: '1234-4321', pubType: 'Print' }],
    'journal-title': 'Bovine noises',
    'journal-NLMTA-ID': 'moo journal',
    publicationDate: '2024-04-04',
    publisher: 'Ungulates United',
    title: 'test title',
    'under-embargo': 'true',
    volume: 'xiii',
  };

  hooks.beforeEach(async function () {
    const repositories = [];
    const journal = {
      issns: [],
    };
    const publication = {
      journal,
    };

    const submission = {
      repositories,
      publication,
      metadata: JSON.stringify(metadata),
    };

    this.set('submission', submission);
    this.set('repositories', repositories);
    this.set('publication', publication);

    Object.defineProperty(window.navigator, 'userAgent', { value: 'Chrome', configurable: true });

    this.fakeAction = sinon.fake();

    const workflowService = this.owner.lookup('service:workflow');
  });

  test('should render common schema', async function (assert) {
    this.repositories[0] = {
      schemas: ['common'],
    };

    await render(hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} />`);
    await waitFor('div[data-name=title]');

    assert.dom('div[data-name=title] input').exists();
    assert.dom('div[data-name=journal-NLMTA-ID] input').doesNotExist();
  });

  test('should render NIHMS schema', async function (assert) {
    this.repositories[0] = {
      schemas: ['common', 'nihms'],
    };

    await render(hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} />`);
    await waitFor('div[data-name=title]');

    assert.dom('div[data-name=title] input').exists();
    assert.dom('div[data-name=journal-NLMTA-ID] input').exists();
  });

  test('should render J10P schema', async function (assert) {
    this.repositories[0] = {
      schemas: ['common', 'jscholarship'],
    };

    await render(hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} />`);
    await waitFor('div[data-name=title]');

    assert.dom('div[data-name=title] input').exists();
    assert.dom('div[data-name=journal-NLMTA-ID] input').doesNotExist();
  });

  test('Test autofilling form fields', async function (assert) {
    this.repositories[0] = {
      schemas: ['common', 'jscholarship', 'nihms'],
    };

    await render(hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} />`);
    await waitFor('div[data-name=title]');

    assert.dom('div[data-name=issue] input').hasValue(metadata.issue);
    assert.dom('div[data-name=volume] input').hasValue(metadata.volume);
    assert.dom('div[data-name=publisher] input').hasValue(metadata.publisher);
    assert.dom('div[data-name=publicationDate] input').hasValue(metadata.publicationDate);
    assert.dom('div[data-name=title] input').hasValue(metadata.title);
    assert.dom('div[data-name=journal-title] input').hasValue(metadata['journal-title']);
    assert.dom('div[data-name=under-embargo] input').hasValue(metadata['under-embargo']);
    assert.dom('div[data-name=Embargo-end-date] input').hasValue(metadata['Embargo-end-date']);
    assert.dom('div[data-name=journal-NLMTA-ID] input').hasValue(metadata['journal-NLMTA-ID']);
    assert.dom('div[data-name=issn] input').hasValue(metadata.issns[0].issn);
    assert.dom('div[aria-label="Publication Type"].sd-input span').hasText(metadata.issns[0].pubType);
    assert.dom('div[data-name=author] input').hasValue(metadata.authors[0].author);
    assert.dom('div[data-name=orcid] input').hasValue(metadata.authors[0].orcid);
    assert.dom('div[data-name=abstract] textarea').hasValue(metadata.abstract);
  });

  test('validation of NIHMS schema', async function (assert) {
    // Validation requires title, journal title, nlmta or issns

    this.submission.metadata = JSON.stringify({});
    this.repositories[0] = {
      schemas: ['common', 'nihms'],
    };

    await render(
      hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} @next={{this.fakeAction}} />`,
    );
    await waitFor('div[data-name=title]');

    await click('input[title=Complete]');
    await waitFor('div[role=alert]');

    // Should fail validation
    assert.dom('div[data-name=title] div[role=alert] span span').hasText('Response required.');
    assert.dom('div[data-name=journal-title] div[role=alert] span span').hasText('Response required.');
    assert.dom('div[data-name=journal-NLMTA-ID] div[role=alert] span span').hasText('Response required.');
    assert.dom('div[data-name=issns] div[role=alert] span span').hasText('Response required.');

    // Fill in required fields
    await fillIn('div[data-name=title] input', 'Baaa');
    await fillIn('div[data-name=journal-title] input', 'Goats are great');
    await fillIn('div[data-name=journal-NLMTA-ID] input', 'goats');

    await click('input[title=Complete]');

    // Validation should succeed
    assert.dom('div[data-name=title] div[role=alert]').doesNotExist();
    assert.dom('div[data-name=journal-title] div[role=alert]').doesNotExist();
    assert.dom('div[data-name=journal-NLMTA-ID] div[role=alert]').doesNotExist();
    assert.dom('div[data-name=issns] div[role=alert]').doesNotExist();
  });

  test('Test readonly form fields', async function (assert) {
    this.repositories[0] = {
      schemas: ['common', 'jscholarship', 'nihms'],
    };

    this.owner.unregister('service:workflow');
    this.owner.register(
      'service:workflow',
      Service.extend({
        getReadOnlyProperties: () => ['title', 'journal-title', 'journal-NLMTA-ID', 'issns'],
      }),
    );

    await render(hbs`<WorkflowMetadata @submission={{this.submission}} @publication={{this.publication}} />`);
    await waitFor('div[data-name=title]');

    assert.dom('div[data-name=title] input.sd-input--readonly').exists();
    assert.dom('div[data-name=journal-title] input.sd-input--readonly').exists();
    assert.dom('div[data-name=journal-NLMTA-ID] input.sd-input--readonly').exists();
    assert.dom('div[data-name=issn] input.sd-input--readonly').exists();

    assert.dom('div[data-name=publisher] input.sd-input--readonly').doesNotExist();
  });
});
