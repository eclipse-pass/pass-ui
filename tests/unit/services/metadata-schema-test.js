import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Service | metadata-schema', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const mockSchema = {
      definitions: {
        form: {
          options: {
            fields: {
              name: { helper: 'Please enter your name' },
              feedback: { type: 'textarea' },
              ranking: { type: 'select', optionLabels: ['Awesome', 'It\'s OK'] }
            }
          },
          properties: {
            name: { type: 'string', title: 'Full name' },
            feedback: { type: 'string' },
            ranking: {
              type: 'string',
              enum: ['excellent', 'ok', 'moo']
            }
          },
          type: 'object'
        }
      },
      allOf: [
        {
          properties: {
            name: { type: 'string' },
            ranking: { type: 'string', enum: ['excellent', 'ok', 'moo'] },
            issns: {
              type: 'array',
              title: 'ISSNs',
              items: {
                properties: {
                  issn: { type: 'string', title: 'ISSN' },
                  pubType: { type: 'string', title: 'Publication Type', enum: ['Print', 'Online'] }
                },
                type: 'object'
              }
            }
          },
          required: ['name', 'ranking']
        }
      ]
    };
    this.set('mockSchema', mockSchema);

    const mockAjax = Service.extend({
      request() {
        return Promise.resolve([mockSchema]);
      }
    });

    run(() => {
      this.owner.unregister('service:ajax');
      this.owner.register('service:ajax', mockAjax);
    });
  });

  /**
   * Simple test showing that #getMetadataSchema uses the AJAX service to retrieve a
   * set of schema
   */
  test('Test against mocked AJAX', function (assert) {
    this.owner.lookup('service:metadata-schema').getMetadataSchemas(['moo', 'too'])
      .then((result) => {
        assert.ok(result, 'No result found');
        assert.ok(result[0].definitions, 'mockSchema.definitions not found');
      });
  });

  test('Should retry request without merge query param on failure', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    let triedWithMerge = false;
    let triedWithoutMerge = false;

    service.set('ajax', EmberObject.create({
      request: (url, options) => {
        if (url.includes('merge')) {
          triedWithMerge = true;
        } else {
          triedWithoutMerge = true;
        }
        assert.ok(true);
        return $.Deferred().reject({}, { status: 409 });
      },
    }));

    service.getMetadataSchemas(['moo', 'too'])
      .then(
        result => assert.ok(false),
        (failure) => {
          assert.ok(triedWithMerge, 'Request did not try with the "merge" query param');
          assert.ok(triedWithoutMerge, 'Request did not try without the "merge" query param');
        }
      );
  });

  test('Alpacafication works as expected', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    service.getMetadataSchemas(['moo', 'two']).then((schemas) => {
      const alpa = service.alpacafySchema(schemas[0]);
      assert.ok(alpa);
      assert.ok(alpa.options);
      assert.ok(alpa.schema);
    });
  });

  /**
   * Test adding data to display in a schema
   */
  test('Test adding display data, editable', function (assert) {
    const data = {
      name: 'Moo Jones',
      feedback: 'Feedbag'
    };
    const service = this.owner.lookup('service:metadata-schema');
    const schema = service.alpacafySchema(this.get('mockSchema'));
    const result = this.owner.lookup('service:metadata-schema').addDisplayData(schema, data);

    assert.ok(result.data, 'No data found in result');
    assert.ok(result.schema, 'Schema not found in result');
    assert.ok(result.options, 'options not found in result');
  });

  /**
   * Another test of adding display data to a schema, but marking them as read-only
   */
  test('Test adding read-only display data', function (assert) {
    const data = {
      name: 'Moo Jones',
      feedback: 'Feedbag'
    };

    const readonly = ['name'];

    const service = this.owner.lookup('service:metadata-schema');
    const schema = service.alpacafySchema(this.get('mockSchema'));
    const result = service.addDisplayData(schema, data, readonly);

    assert.ok(result, 'No result found');
    assert.ok(result.data, 'No data found in result');

    assert.ok(result.options.fields.name.readonly, 'Property \'name\' not marked as read only');
    assert.notOk(result.options.fields.feedback.readonly, 'Property \'feedback\' marked as read only');
  });

  test('Validation should fail when "name" field is not present in data', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    assert.notOk(service.validate(this.get('mockSchema'), {}), 'Should not validate');

    const errors = service.getErrors();
    assert.equal(1, errors.length, 'Should be 1 error');
    assert.equal(errors[0].message, 'should have required property \'name\'');
  });

  test('Validation should fail when "ranking" value is something not in enum', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const data = {
      name: 'Moo Jones',
      ranking: 'invalid-moo'
    };
    // debugger
    assert.notOk(service.validate(this.get('mockSchema'), data), 'Validation should fail');

    const errors = service.getErrors();
    assert.equal(1, errors.length, 'Should have found 1 error');
  });

  test('Try validating bad ISSN info', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const data = {
      name: 'Moo Jones',
      ranking: 'moo',
      issns: [
        {
          issn: '1234',
          pubType: 'Electronic'
        }
      ]
    };

    assert.notOk(service.validate(this.get('mockSchema'), data), 'Validation should fail');

    const errors = service.getErrors();
    assert.equal(1, errors.length, 'Should have found 1 error');
  });

  test('Get fields includes \'allOf\' properties', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const result = service.getFields([this.get('mockSchema')]);

    assert.ok(result, 'No results found');
    assert.ok(result.includes('issns'));
  });

  test('Get fields does not include \'allOf\' properties when told not to', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const result = service.getFields([this.get('mockSchema')], true);

    assert.ok(result, 'No results found');
    assert.notOk(result.includes('issns'));
  });

  test('Get field to title map', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const result = service.getFieldTitleMap([this.get('mockSchema')]);

    assert.ok(result);
    assert.equal(result.name, 'Full name');
    assert.equal(result.feedback, 'Feedback');
    assert.equal(result.issns, 'ISSNs', 'issns field from "allOf" block should be included');
  });

  test('Should format complex metadata', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const submission = EmberObject.create({
      repositories: [],
      metadata: JSON.stringify({
        issns: [
          { issn: '123-moo' },
          { issn: 'moo-321', pubType: 'Print' }
        ]
      })
    });

    const result = await service.displayMetadata(submission);
    const expected = [
      {
        label: 'ISSNs',
        isArray: true,
        value: [
          { ISSN: '123-moo' },
          { ISSN: 'moo-321 (Print)' }
        ]
      }
    ];

    assert.deepEqual(result, expected);
  });

  test('Key not found in whitelist is not displayed', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const submission = EmberObject.create({
      repositories: [],
      metadata: JSON.stringify({ name: 'Bessie Cow' })
    });

    const result = await service.displayMetadata(submission);
    const expected = [];

    assert.deepEqual(result, expected);
  });

  test('mergeBlobs does not delete data normally', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const b1 = { one: '1 moo', two: '2 moo' };
    const b2 = { two: 'moo too' };

    const expected = { one: '1 moo', two: 'moo too' };

    assert.deepEqual(service.mergeBlobs(b1, b2), expected);
  });

  test('mergeBlobs can delete only specified fields', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const b1 = { one: '1 moo', two: '2 moo' };
    const b2 = { two: 'moo too' };

    const list = ['one', 'two'];

    const expected = { two: 'moo too' };

    assert.deepEqual(service.mergeBlobs(b1, b2, list), expected);
  });
});
