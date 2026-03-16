import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import type DoiService from 'pass-ui/services/doi';
import type JournalModel from 'pass-ui/models/journal';

module('Unit | Service | doi', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.set('mockDoiInfo', {
      'issn-map': {
        '0003-2654': { 'pub-type': ['Print'] },
        '1364-5528': { 'pub-type': ['Electronic'] },
      },
      author: [
        {
          ORCID: 'https://orcid.org/0000-0003-2974-7389',
          'authenticated-orcid': false,
          given: 'Moo',
          family: 'Jones',
          sequence: 'first',
        },
        {
          given: 'Moo, Jr',
          family: 'Jones',
          sequence: 'additional',
        },
      ],
    });

    this.set('mockDoiInfo2', {
      publisher: 'Royal Society of Chemistry (RSC)',
      issue: 1,
      'short-container-title': 'Analyst',
      abstract:
        '<p>The investigators report a dramatically improved chemoselective analysis for carbonyls in crude biological extracts by turning to a catalyst and freezing conditions for derivatization.</p>',
      DOI: '10.1039/c7an01256j',
      type: 'journal-article',
      page: '311-322',
      'update-policy': 'https://dx.doi.org/10.1039/rsc_crossmark_policy',
      source: 'Crossref',
      'is-referenced-by-count': 5,
      title: [
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS',
      ],
      prefix: '10.1039',
      volume: '143',
      'container-title': ['The Analyst'],
      'original-title': [],
      language: 'en',
      ISSN: ['0003-2654', '1364-5528'],
      'issn-type': [
        { value: '0003-2654', type: 'print' },
        { value: '1364-5528', type: 'electronic' },
      ],
    });
  });

  // Test DOI object here based on CrossRef data
  test('check doi data processing', function (assert) {
    const service = this.owner.lookup('service:doi') as DoiService;
    const doiInfo = this.mockDoiInfo;
    const journal = {
      issns: ['odd', 'Print:moo', 'Online:chitter', 'malformed:', ':oddagain', ':'],
    } as unknown as JournalModel;
    const result = service.doiToMetadata(doiInfo, journal);

    assert.ok(result, 'No result was returned');
    assert.ok(result.authors, 'Was expecting "authors" property to exist');
    assert.ok(result.issns, 'Was expecting "issns" field to exist');

    assert.propEqual(
      result.authors,
      [
        {
          ORCID: 'https://orcid.org/0000-0003-2974-7389',
          'authenticated-orcid': false,
          given: 'Moo',
          family: 'Jones',
          sequence: 'first',
          orcid: 'https://orcid.org/0000-0003-2974-7389',
          author: 'Moo Jones',
        },
        {
          given: 'Moo, Jr',
          family: 'Jones',
          sequence: 'additional',
          orcid: undefined,
          author: 'Moo, Jr Jones',
        },
      ],
      'Unexpected "authors" found',
    );

    assert.propEqual(
      result.issns,
      [
        {
          issn: 'odd',
        },
        {
          issn: 'moo',
          pubType: 'Print',
        },
        {
          issn: 'chitter',
          pubType: 'Online',
        },
        {
          issn: 'oddagain',
        },
      ],
      'Unexpected "issns" found',
    );
  });

  test('make sure we only get valid fields back', function (assert) {
    const doiInfo = this.mockDoiInfo;
    doiInfo.invalid = 'Bad moo';
    const journal = {
      issns: ['Print:moo'],
    } as unknown as JournalModel;
    const result = (this.owner.lookup('service:doi') as DoiService).doiToMetadata(doiInfo, journal, ['authors']);
    assert.ok(result);
    assert.notOk(result.invalid);
  });

  test('should stringify array values', function (assert) {
    const doiInfo = this.mockDoiInfo2;

    const result = (this.owner.lookup('service:doi') as DoiService)._processRawDoi(doiInfo);
    assert.ok(result);
    assert.strictEqual(typeof result['journal-title'], 'string', '"journal-title" should be a string');
    assert.strictEqual(typeof result.title, 'string', '"title" should be a string');
    assert.strictEqual(typeof result['short-container-title'], 'string', '"short-container-title" should be a string');
    assert.notEqual(typeof result.ISSN, 'string', 'Should not stringify this array value');
  });

  test('resolve DOI', function (assert) {
    const service = this.owner.lookup('service:doi') as DoiService;
    const doiInfo = this.mockDoiInfo2;
    const journalId = 'blah';

    this.server.get('/journal', () => {
      const result = {
        crossref: { message: doiInfo },
        'journal-id': journalId,
      };

      return result;
    });

    service.store = {
      request(req: { url: string }) {
        assert.ok(true);
        assert.true(req.url.includes('/data/journal/'), 'URL includes journal path');

        const journal = { id: 'journal' };
        return Promise.resolve({ content: { data: journal } });
      },

      createRecord(type: string, values: Record<string, unknown>) {
        assert.strictEqual(type, 'publication');

        return { ...values };
      },
    } as unknown as typeof service.store;

    assert.expect(7);

    return service.resolveDOI.perform(doiInfo.DOI).then((result) => {
      assert.ok(result.publication);
      assert.ok(result.doiInfo);

      assert.strictEqual(doiInfo.DOI, result.publication.doi);
      assert.strictEqual(doiInfo.DOI, result.doiInfo.DOI);
    });
  });

  test("Make sure we don't choke on journal with no ISSNs", function (assert) {
    const journal = {
      nlmta: 'NLmooTA',
    } as unknown as JournalModel;
    const doiInfo = this.mockDoiInfo;
    const service = this.owner.lookup('service:doi') as DoiService;

    const result = service.doiToMetadata(doiInfo, journal);

    assert.ok(result);
    assert.strictEqual((result.issns as unknown[]).length, 0);
    assert.strictEqual(result['journal-NLMTA-ID'], 'NLmooTA');
  });
});
