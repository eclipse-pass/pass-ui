import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { fillIn, render, waitUntil } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Integration | Component | workflow basics', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let publication = Ember.Object.create({ doi: 'test' });
    let preLoadedGrant = Ember.Object.create({});
    let flaggedFields = [];
    let doiInfo = [];
    this.set('submission', submission);
    this.set('publication', publication);
    this.set('preLoadedGrant', preLoadedGrant);
    this.set('doiInfo', doiInfo);
    this.set('flaggedFields', '[]');
    // pass in actions that do nothing
    this.set('validateTitle', (actual) => { });
    this.set('validateJournal', (actual) => { });
    this.set('validateSubmitterEmail', (actual) => { });
    this.set('loadNext', (actual) => {});

    const mockDoiService = Ember.Service.extend({
      resolveDOI(doi) {
        return Promise.resolve({
          doiInfo: {
            publisher: 'Royal Society of Chemistry (RSC)',
            issue: 1,
            'short-container-title': 'Analyst',
            abstract: '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
            DOI: '10.1039/c7an01256j',
            type: 'journal-article',
            page: '311-322',
            'update-policy': 'http://dx.doi.org/10.1039/rsc_crossmark_policy',
            source: 'Crossref',
            'is-referenced-by-count': 5,
            title: 'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
            prefix: '10.1039',
            volume: '143',
            'container-title': 'The Analyst',
            'original-title': '',
            language: 'en',
            ISSN: ['0003-2654', '1364-5528'],
            'issn-type': [
              { value: '0003-2654', type: 'print' },
              { value: '1364-5528', type: 'electronic' }
            ],
          },
          publication: Ember.Object.create({
            abstract: '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
            doi: '1234/4321',
            issue: 1,
            title: 'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
            volume: '143',
            journal: Ember.Object.create({ journalName: 'moo-title' })
          })
        });
      },
      formatDOI(doi) {
        return 'moo';
      },
      isValidDOI() {
        return true;
      },
      getJournalTitle() {
        return 'moo-title';
      }
    });

    const mockStore = Ember.Service.extend({
      query(type, query) {
        return Promise.resolve(Ember.A());
      },
      createRecord() {
        return Ember.Object.create({
          save() {
            return Promise.resolve();
          }
        });
      }
    });

    run(() => {
      this.owner.unregister('service:doi');
      this.owner.register('service:doi', mockDoiService);

      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);
    });
  });

  test('lookupDOI should set doiInfo and publication', async function (assert) {
    this.set('validateTitle', () => assert.ok(true));

    await render(hbs`{{workflow-basics
      submission=submission
      publication=publication
      preLoadedGrant=preLoadedGrant
      doiInfo=doiInfo
      flaggedFields=flaggedFields
      validateTitle=(action validateTitle)
      validateJournal=(action validateJournal)
      validateSubmitterEmail=(action validateSubmitterEmail)
      next=(action loadNext)}}`);

    // Add a DOI to UI
    await fillIn('#doi', '1234/4321');

    assert.equal(this.get('doiInfo').DOI, '10.1039/c7an01256j');
    assert.equal(this.get('publication.doi'), '1234/4321');
    assert.equal(this.get('publication.issue'), '1');
  });

  /**
   * Test case:
   *  - Draft submission
   *  - Publication has a DOI
   *
   * Expect:
   * DOI, title, and journal should be added to the UI inputs when things settle
   */
  test('Info is filled in when a submission is provided with a publication and DOI', async function (assert) {
    const publication = this.get('publication');
    const submission = this.get('submission');

    submission.set('publication', publication);

    await render(hbs`{{workflow-basics
      submission=submission
      publication=publication
      preLoadedGrant=preLoadedGrant
      doiInfo=doiInfo
      flaggedFields=flaggedFields
      validateTitle=(action validateTitle)
      validateJournal=(action validateJournal)
      validateSubmitterEmail=(action validateSubmitterEmail)
      next=(action loadNext)}}`);
    assert.ok(this.element);

    // await waitUntil(() => new Promise(resolve => setTimeout(() => { debugger; resolve(); }, 1000)));
    // 2 inputs, 1 textarea
    const inputs = this.element.querySelectorAll('input');
    const title = this.element.querySelector('textarea');

    assert.equal(inputs.length, 2, 'There should be two input elements');
    assert.ok(title, 'No "title" textarea element found');

    assert.ok(title.textLength > 0, 'No title value found');
    inputs.forEach((inp) => {
      const msg = `No value found for input "${inp.parentElement.parentElement.querySelector('label').textContent}"`;
      assert.ok(!!inp.value, msg);
    });
  });

  /**
   * Test this by first adding metadata to the submission with some fields containing values that
   * differ from equivalent fields defined in the mock DOI service.
   */
  test('Draft submission metadata is not overwritten by DOI data', async function (assert) {
    // First override the DOI service to ensure that it isn't called
    this.set('doiService', {
      resolveDOI: () => assert.ok(false, 'resolveDOI should not be called'),
      formatDOI: () => asssert.ok(false, 'formatDOI should not be called'),
      isValidDOI: () => assert.ok(false, 'isValidDOI should not be called')
    });

    const pub = Ember.Object.create({
      doi: 'ThisIsADOI',
      title: 'Moo title',
      journal: Ember.Object.create({ journalName: 'Moo Journal' })
    });
    this.set('publication', pub);

    // Add metadata to submission
    const submission = Ember.Object.create({
      publication: pub,
      metadata: JSON.stringify({ title: 'You better use this' })
    });
    this.set('submission', submission);

    await render(hbs`{{workflow-basics
      submission=submission
      publication=publication
      preLoadedGrant=preLoadedGrant
      doiInfo=doiInfo
      flaggedFields=flaggedFields
      validateTitle=(action validateTitle)
      validateJournal=(action validateJournal)
      validateSubmitterEmail=(action validateSubmitterEmail)
      next=(action loadNext)}}`);
    assert.ok(this.element);

    // Check values of various inputs
    const inputs = this.element.querySelectorAll('input');
    const title = this.element.querySelector('textarea');

    assert.equal(inputs.length, 2, 'There should be two input elements');
    assert.ok(title, 'No "title" textarea element found');

    assert.ok(title.textLength > 0, 'No title value found');
    inputs.forEach((inp) => {
      const msg = `No value found for input "${inp.parentElement.parentElement.querySelector('label').textContent}"`;
      assert.ok(!!inp.value, msg);
    });

    // Check submission metadata
    const md = JSON.parse(this.get('submission.metadata'));
    assert.ok(md, 'no metadata found');
    assert.equal(md.title, 'You better use this', 'Unexpected metadata!');
  });
});
