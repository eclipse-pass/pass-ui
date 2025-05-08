/* eslint-disable ember/no-classic-classes, ember/no-get, ember/no-settled-after-test-helper */
import { A } from '@ember/array';
import Service from '@ember/service';
import EmberObject, { get } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { doubleClick, fillIn, render, settled, triggerKeyEvent } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { task } from 'ember-concurrency';
import sinon from 'sinon';

module('Integration | Component | workflow basics', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let submission = EmberObject.create({
      repositories: [],
      grants: [],
    });
    let publication = EmberObject.create({
      doi: 'test',
      // title: 'Moo title',
      // journal: Ember.Object.create({ journalName: 'Moo Journal' })
    });
    let preLoadedGrant = EmberObject.create({});
    let flaggedFields = [];
    let doiInfo = [];
    this.set('submission', submission);
    this.set('publication', publication);
    this.set('preLoadedGrant', preLoadedGrant);
    this.set('doiInfo', doiInfo);
    this.set('flaggedFields', '[]');
    // pass in actions that do nothing
    this.set('validateTitle', (actual) => {});
    this.set('validateJournal', (actual) => {});
    this.set('validateSubmitterEmail', (actual) => {});
    this.set('loadNext', (actual) => {});
    this.set('updatePublication', (publication) => this.set('publication', publication));
    this.set('updateDoiInfo', (doiInfo) => this.set('doiInfo', doiInfo));

    const mockDoiService = Service.extend({
      resolveDOI: task(function* (doi) {
        return yield Promise.resolve({
          doiInfo: {
            publisher: 'Royal Society of Chemistry (RSC)',
            issue: 1,
            'short-container-title': 'Analyst',
            abstract:
              '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
            DOI: '10.1039/c7an01256j',
            type: 'journal-article',
            page: '311-322',
            'update-policy': 'http://dx.doi.org/10.1039/rsc_crossmark_policy',
            source: 'Crossref',
            'is-referenced-by-count': 5,
            title:
              'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
            prefix: '10.1039',
            volume: '143',
            'container-title': 'The Analyst',
            'original-title': '',
            language: 'en',
            ISSN: ['0003-2654', '1364-5528'],
            'issn-type': [
              { value: '0003-2654', type: 'print' },
              { value: '1364-5528', type: 'electronic' },
            ],
          },
          publication: EmberObject.create({
            abstract:
              '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
            doi: '1234/4321',
            issue: 1,
            title:
              'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
            volume: '143',
            journal: EmberObject.create({ journalName: 'moo-title' }),
          }),
        });
      }),
      formatDOI(doi) {
        return 'moo';
      },
      isValidDOI() {
        return true;
      },
      getJournalTitle() {
        return 'moo-title';
      },
      doiToMetadata(doiInfo, journal, validFields) {
        console.log('grr');
        return doiInfo;
      },
    });

    const mockStore = Service.extend({
      query(type, query) {
        return Promise.resolve(A());
      },
      createRecord() {
        return EmberObject.create({
          save() {
            return Promise.resolve();
          },
        });
      },
    });

    const mockStaticConfig = Service.extend({
      getStaticConfig: () =>
        Promise.resolve({
          branding: {
            stylesheet: '',
            pages: {
              contactUrl: '',
            },
          },
        }),
      addCss: () => {},
    });

    run(() => {
      this.owner.unregister('service:doi');
      this.owner.register('service:doi', mockDoiService);

      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);

      this.owner.unregister('service:app-static-config');
      this.owner.register('service:app-static-config', mockStaticConfig);
    });
  });

  test('lookupDOI should set doiInfo and publication', async function (assert) {
    this.set('validateTitle', () => true);

    await render(hbs`<WorkflowBasics
  @submission={{this.submission}}
  @publication={{this.publication}}
  @preLoadedGrant={{this.preLoadedGrant}}
  @doiInfo={{this.doiInfo}}
  @flaggedFields={{this.flaggedFields}}
  @validateTitle={{this.validateTitle}}
  @validateJournal={{this.validateJournal}}
  @validateSubmitterEmail={{this.validateSubmitterEmail}}
  @updatePublication={{this.updatePublication}}
  @updateDoiInfo={{this.updateDoiInfo}}
  @next={{this.loadNext}}
/>`);

    // Add a DOI to UI
    await fillIn('#doi', '1234/4321');

    assert.strictEqual(get(this, 'publication.doi'), '1234/4321');
    assert.strictEqual(get(this, 'publication.issue'), 1);
  });

  /**
   * Test case:
   *  - Draft submission
   *  - Publication has valid data
   *
   * Expect:
   * DOI, title, and journal should be added to the UI inputs when things settle
   *
   * In this test case, a draft submission is provided to the component with a
   * Publication object already attached. The title, DOI, and Journal from the
   * Publication should be displayed in the appropriate elements.
   */
  test('Info is filled in when a submission is provided with a publication and DOI', async function (assert) {
    const publication = get(this, 'publication');
    const submission = get(this, 'submission');

    publication.set('title', 'Moo title');
    publication.set('journal', EmberObject.create({ journalName: 'Moo Journal' }));

    submission.set('publication', publication);

    await render(hbs`<WorkflowBasics
  @submission={{this.submission}}
  @publication={{this.publication}}
  @preLoadedGrant={{this.preLoadedGrant}}
  @doiInfo={{this.doiInfo}}
  @flaggedFields={{this.flaggedFields}}
  @validateTitle={{this.validateTitle}}
  @validateJournal={{this.validateJournal}}
  @validateSubmitterEmail={{this.validateSubmitterEmail}}
  @updatePublication={{this.updatePublication}}
  @updateDoiInfo={{this.updateDoiInfo}}
  @next={{this.loadNext}}
/>`);

    assert.ok(this.element);
    assert.dom('#title').hasValue('Moo title');
    assert.dom('#doi').hasValue('moo');
  });

  /**
   * - Publication object exists
   * - Journal exists on Publication
   * - No metadata on submission
   *
   * The submission already has a Publication object with a Journal, but no metadata.
   * We should call the DOI service to get the metadata, but should NOT replace the
   * publication on the submission.
   */
  test('Draft submission with empty metadata looksup DOI', async function (assert) {
    const pub = EmberObject.create({
      doi: 'ThisIsADOI',
      title: 'Moo title',
      journal: EmberObject.create({ journalName: 'Moo Journal' }),
    });
    this.set('publication', pub);

    // Add metadata to submission
    const submission = EmberObject.create({
      publication: pub,
      metadata: '{}',
    });
    this.set('submission', submission);

    this.owner.register(
      'service:doi',
      Service.extend({
        resolveDOI: task(function* () {
          return yield Promise.resolve({
            publication: EmberObject.create({
              title: 'Do not want',
            }), // This publication should not be used
            doiInfo: { title: 'You better use this' },
          });
        }),
        formatDOI: () => 'Formatted-Moo',
        isValidDOI: () => true,
      }),
    );

    await render(hbs`<WorkflowBasics
  @submission={{this.submission}}
  @publication={{this.publication}}
  @preLoadedGrant={{this.preLoadedGrant}}
  @doiInfo={{this.doiInfo}}
  @flaggedFields={{this.flaggedFields}}
  @validateTitle={{this.validateTitle}}
  @validateJournal={{this.validateJournal}}
  @validateSubmitterEmail={{this.validateSubmitterEmail}}
  @updatePublication={{this.updatePublication}}
  @updateDoiInfo={{this.updateDoiInfo}}
  @next={{this.loadNext}}
/>`);

    assert.ok(this.element);

    const publication = get(this, 'publication');
    assert.ok(publication, 'No publication found');
    assert.strictEqual(publication.get('title'), 'Moo title', 'Unexpected publication title found');
    assert.strictEqual(publication.get('journal.journalName'), 'Moo Journal', 'Unexpected journal title found');

    // Metadata will only change on journal selection, doi lookup, or transition to next step
    const metadata = get(this, 'submission.metadata');
    assert.equal(metadata, '{}', 'Metadata should be empty');
  });

  /**
   * Word of the day: DOI
   *
   * Test for a case where a user enters a DOI that is resolved by the DOI service, progresses through
   * the workflow a bit, then goes back to Step 1 and removes the DOI from the submission. Image two
   * known DOIs, the user enters the first DOI, which contains a lot of data, such as many authors. This
   * data is saved to the submission metadata as the user progresses far enough through the workflow.
   * The user then goes back and enters a 2nd DOI that does not contain any author information. The data
   * from the first DOI _should_ be removed, or else it will dirty the submission metadata along side
   * the correct data from the second DOI. In this case, authors will exist "with the 2nd DOI" even though
   * they were only associated with the first DOI.
   *
   * In this case, I think it should be the case that the submission metadata that originally came
   * from the DOI lookup should be removed, as well as the title and journal. The user will then be free
   * to enter another DOI or manually enter a title and journal. The user _may_ lose some manually entered
   * submission metadata if they provided any. I think this tradeoff is fair to avoid cross contamination
   * of data.
   */
  test('Submission metadata and other UI fields should be reset if a DOI is removed', async function (assert) {
    const publication = EmberObject.create({
      doi: 'moo',
      title: 'Moo title',
      journal: EmberObject.create({
        journalName: 'Moo Journalitics',
      }),
    });
    this.set('publication', publication);

    const submission = EmberObject.create({
      publication,
      metadata: JSON.stringify({
        title: 'this is a moo, please ignore',
        authors: [{ author: 'Moo Jones' }],
      }),
    });
    this.set('submission', submission);

    const mockDoiService = Service.extend({
      resolveDOI: task(function* () {
        return yield Promise.resolve({
          doiInfo: {
            title: "Don't use",
          },
          publication,
        });
      }),
      isValidDOI: (doi) => !!doi,
      formatDOI: (doi) => doi,
      doiToMetadata: (doiInfo, journal, validFields) => {
        return doiInfo;
      },
    });

    this.owner.unregister('service:doi');
    this.owner.register('service:doi', mockDoiService);

    await render(hbs`<WorkflowBasics
  @submission={{this.submission}}
  @publication={{this.publication}}
  @preLoadedGrant={{this.preLoadedGrant}}
  @doiInfo={{this.doiInfo}}
  @flaggedFields={{this.flaggedFields}}
  @validateTitle={{this.validateTitle}}
  @validateJournal={{this.validateJournal}}
  @validateSubmitterEmail={{this.validateSubmitterEmail}}
  @updatePublication={{this.updatePublication}}
  @updateDoiInfo={{this.updateDoiInfo}}
  @next={{this.loadNext}}
/>`);

    assert.ok(this.element);

    await fillIn('input[id="doi"]', '');
    await triggerKeyEvent('input[id="doi"]', 'keyup', 'Enter');
    await settled();
    assert.notOk(
      get(this, 'publication.doi'),
      'After clearing the DOI input, there should no longer be a doi value on the publication',
    );

    const inputs = this.element.querySelectorAll('input');
    assert.strictEqual(inputs.length, 1, 'There should be one text input');
    inputs.forEach((input) => assert.notOk(input.hasAttribute('readonly')));

    const titleIn = this.element.querySelector('textarea');
    assert.ok(titleIn);
    assert.notOk(titleIn.hasAttribute('readonly'));

    /**
     * Can't check for 'readonly' attribute, because the journal "input"
     * is actually a PowerSelect div. The lack of the 'input' does actually
     * suggest that things are working as intended, because this particular
     * input should change from a normal text input to a PowerSelect when
     * theh DOI goes away
     */
    assert.dom('[data-test-find-journal]').doesNotExist();

    assert.deepEqual(get(this, 'submission.metadata'), '{}', 'submission metadata should be empty');
  });

  test('validateAndLoadTab is called once when next is clicked', async function (assert) {
    this.publication.title = 'Moo title';
    this.publication.journal = EmberObject.create({ journalName: 'Moo Journal' });

    this.submission.publication = this.publication;

    this.validateAndLoadTab = sinon.stub();

    await render(hbs`<WorkflowBasics
  @submission={{this.submission}}
  @publication={{this.publication}}
  @preLoadedGrant={{this.preLoadedGrant}}
  @doiInfo={{this.doiInfo}}
  @flaggedFields={{this.flaggedFields}}
  @validateTitle={{this.validateTitle}}
  @validateJournal={{this.validateJournal}}
  @validateSubmitterEmail={{this.validateSubmitterEmail}}
  @updatePublication={{this.updatePublication}}
  @updateDoiInfo={{this.updateDoiInfo}}
  @validateAndLoadTab={{this.validateAndLoadTab}}
/>`);

    await doubleClick('[data-test-workflow-basics-next]');

    assert.ok(this.validateAndLoadTab.calledOnce, 'validateAndLoadTab called once');
  });
});
