import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Service | doi', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.set('mockDoiInfo', {
      'issn-map': {
        '0003-2654': { 'pub-type': ['Print'] },
        '1364-5528': { 'pub-type': ['Electronic'] }
      },
      author: [
        {
          ORCID: 'http://orcid.org/0000-0003-2974-7389',
          'authenticated-orcid': false,
          given: 'Moo',
          family: 'Jones',
          sequence: 'first'
        },
        {
          given: 'Moo, Jr',
          family: 'Jones',
          sequence: 'additional'
        }
      ]
    });

    this.set('mockDoiInfo2', {
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
      title: [
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      ],
      prefix: '10.1039',
      volume: '143',
      'container-title': ['The Analyst'],
      'original-title': [],
      language: 'en',
      ISSN: ['0003-2654', '1364-5528'],
      'issn-type': [
        { value: '0003-2654', type: 'print' },
        { value: '1364-5528', type: 'electronic' }
      ],
    });
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:doi');
    assert.ok(service);
  });

  // Test DOI object here based on CrossRef data
  test('check doi data processing', function (assert) {
    const service = this.owner.lookup('service:doi');
    const doiInfo = this.get('mockDoiInfo');
    const journal = EmberObject.create({
      issns: ['odd', 'Print:moo', 'Online:chitter', 'malformed:', ':oddagain', ':'],
    });
    const result = service.doiToMetadata(doiInfo, journal);

    assert.ok(result, 'No result was returned');
    assert.ok(result.authors, 'Was expecting "authors" property to exist');
    assert.ok(result.issns, 'Was expecting "issns" field to exist');
    assert.ok(result.$schema, 'Missing $schema');

    assert.deepEqual(
      result.authors,
      [
        {
          ORCID: 'http://orcid.org/0000-0003-2974-7389',
          'authenticated-orcid': false,
          given: 'Moo',
          family: 'Jones',
          sequence: 'first',
          orcid: 'http://orcid.org/0000-0003-2974-7389',
          author: 'Moo Jones'
        },
        {
          given: 'Moo, Jr',
          family: 'Jones',
          sequence: 'additional',
          orcid: undefined,
          author: 'Moo, Jr Jones'
        }
      ],
      'Unexpected "authors" found'
    );

    assert.deepEqual(
      result.issns,
      [
        {
          issn: 'odd'
        },
        {
          issn: 'moo',
          pubType: 'Print'
        },
        {
          issn: 'chitter',
          pubType: 'Online'
        },
        {
          issn: 'oddagain'
        }
      ],
      'Unexpected "issns" found'
    );
  });

  test('make sure we only get valid fields back', function (assert) {
    let doiInfo = this.get('mockDoiInfo');
    doiInfo.invalid = 'Bad moo';
    const journal = EmberObject.create({
      issns: ['Print:moo'],
    });
    const result = this.owner.lookup('service:doi').doiToMetadata(doiInfo, journal, ['authors']);
    assert.ok(result);
    assert.notOk(result.invalid);
  });

  test('should stringify array values', function (assert) {
    const doiInfo = this.get('mockDoiInfo2');

    const result = this.owner.lookup('service:doi')._processRawDoi(doiInfo);
    assert.ok(result);
    assert.equal(typeof result['journal-title'], 'string', '"journal-title" should be a string');
    assert.equal(typeof result.title, 'string', '"title" should be a string');
    assert.equal(typeof result['short-container-title'], 'string', '"short-container-title" should be a string');
    assert.notEqual(typeof result.ISSN, 'string', 'Should not stringify this array value');
  });

  test('resolve DOI', function (assert) {
    const service = this.owner.lookup('service:doi');
    const doiInfo = this.get('mockDoiInfo2');
    const journalId = 'blah';

    service.set('ajax', EmberObject.create({
      request(url, method, options) {
        assert.ok(true);

        let journal = EmberObject.create({ id: 'journal' });

        let result = {
          crossref: { message: doiInfo },
          'journal-id': journalId
        };

        return new Promise(resolve => resolve(result));
      }
    }));

    service.set('store', EmberObject.create({
      findRecord(type, id) {
        assert.ok(true);
        assert.equal(type, 'journal');

        let journal = EmberObject.create({ id: 'journal' });
        return new Promise(resolve => resolve(journal));
      },

      createRecord(type, values) {
        assert.equal(type, 'publication');

        return EmberObject.create(values);
      }
    }));

    assert.expect(8);

    return service.get('resolveDOI').perform(doiInfo.DOI).then((result) => {
      assert.ok(result.publication);
      assert.ok(result.doiInfo);

      assert.equal(doiInfo.DOI, result.publication.doi);
      assert.equal(doiInfo.DOI, result.doiInfo.DOI);
    });
  });

  test('Make sure we don\'t choke on journal with no ISSNs', function (assert) {
    const journal = EmberObject.create({
      nlmta: 'NLmooTA'
    });
    const doiInfo = this.get('mockDoiInfo');
    const service = this.owner.lookup('service:doi');

    const result = service.doiToMetadata(doiInfo, journal);

    assert.ok(result);
    assert.equal(result.issns.length, 0);
    assert.equal(result['journal-NLMTA-ID'], 'NLmooTA');
  });
});
