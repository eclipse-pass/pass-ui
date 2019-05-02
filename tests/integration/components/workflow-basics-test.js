import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, fillIn, triggerKeyEvent, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Integration | Component | workflow basics', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let publication = Ember.Object.create({});
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

    const mockNlmta = Ember.Service.extend({
      getNlmtaFromIssn() {
        return {
          nlmta: 'nl-moo-ta',
          'issn-map': {
            '0003-2654': { 'pub-type': 'print' },
            '1364-5528': { 'pub-type': 'electronic' }
          }
        };
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

      this.owner.unregister('service:nlmta');
      this.owner.register('service:nlmta', mockNlmta);

      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);
    });
  });

  // eslint-disable-next-line prefer-arrow-callback
  test('it renders', async function (assert) {
    await render(hbs`{{workflow-basics
      submission=submission
      preLoadedGrant=preLoadedGrant
      publication=publication
      doiInfo=doiInfo
      flaggedFields=flaggedFields
      validateTitle=(action validateTitle)
      validateJournal=(action validateJournal)
      validateSubmitterEmail=(action validateSubmitterEmail)
      next=(action loadNext)}}`);
    assert.ok(true);
  });

  test('lookupDOI should create valid Publication', async function (assert) {
    const origPub = Ember.Object.create({ doi: 'fake-doi' });
    const publication = Ember.Object.create({
      doi: 'fake-doi'
    });
    const submission = Ember.Object.create({
      repositories: Ember.A(),
      grants: Ember.A()
    });

    this.set('submission', submission);
    this.set('publication', publication);

    // this.set('lookupDOI', () => assert.ok(true));
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

    assert.notDeepEqual(publication, origPub);
    assert.deepEqual(
      publication.getProperties(['abstract', 'doi', 'issue', 'title', 'volume']),
      {
        abstract: '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
        doi: '1234/4321',
        issue: 1,
        title: 'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
        volume: '143'
      },
      'Unexpected publication data found'
    );
  });
});
