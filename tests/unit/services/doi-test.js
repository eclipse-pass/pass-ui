import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | doi', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.set('mockDoi', {
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
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:doi');
    assert.ok(service);
  });

  // Test DOI object here based on CrossRef data
  test('check doi data processing', function (assert) {
    const service = this.owner.lookup('service:doi');
    const doi = this.get('mockDoi');

    const result = service.doiToMetadata(doi);

    assert.ok(result, 'No result was returned');
    assert.ok(result.authors, 'Was expecting "authors" property to exist');
    assert.ok(result.issns, 'Was expecting "issns" field to exist');

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
  });

  test('make sure we only get valid fields back', function (assert) {
    let doi = this.get('mockDoi');
    doi.invalid = 'Bad moo';

    const result = this.owner.lookup('service:doi').doiToMetadata(doi, ['authors', 'issn-map']);
    assert.ok(result);
    assert.notOk(result.invalid);
  });
});
