/* eslint-disable ember/no-classic-classes, ember/no-get */
import EmberObject, { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import sinon from 'sinon';
import { Response } from 'miragejs';
import { settled } from '@ember/test-helpers';

module('Unit | Service | metadata-schema', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.mockSchema = {
      definitions: {
        form: {
          options: {
            fields: {
              name: { helper: 'Please enter your name' },
              feedback: { type: 'textarea' },
              ranking: { type: 'select', optionLabels: ['Awesome', "It's OK"] },
            },
          },
          properties: {
            name: { type: 'string', title: 'Full name' },
            feedback: { type: 'string' },
            ranking: {
              type: 'string',
              enum: ['excellent', 'ok', 'moo'],
            },
          },
          type: 'object',
        },
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
                  pubType: { type: 'string', title: 'Publication Type', enum: ['Print', 'Online'] },
                },
                type: 'object',
              },
            },
          },
          required: ['name', 'ranking'],
        },
      ],
    };

    this.server.get('/schema', (_schema, _request) => {
      return [this.mockSchema];
    });
  });

  /**
   * Simple test showing that #getMetadataSchema uses the AJAX service to retrieve a
   * set of schema
   */
  test('Test against mocked getMetadataSchemas endpoint', function (assert) {
    this.owner
      .lookup('service:metadata-schema')
      .getMetadataSchemas(['moo', 'too'])
      .then((result) => {
        assert.ok(result, 'No result found');
        assert.ok(result[0].definitions, 'mockSchema.definitions not found');
      });
  });

  test('Should retry request without merge query param on failure', async function (assert) {
    this.server.get('/schema', (_schema, request) => {
      if (request.queryParams.merge === 'true') {
        return new Response(500);
      }
      return [this.mockSchema];
    });

    const service = this.owner.lookup('service:metadata-schema');

    const _fetchSchemasSpy = sinon.spy(service, '_fetchSchemas');

    service.getMetadataSchemas(['moo', 'too']);

    await settled();

    assert.ok(_fetchSchemasSpy.calledTwice, 'fetch schema was called twice');
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
      feedback: 'Feedbag',
    };
    const service = this.owner.lookup('service:metadata-schema');
    const schema = service.alpacafySchema(get(this, 'mockSchema'));
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
      feedback: 'Feedbag',
    };

    const readonly = ['name'];

    const service = this.owner.lookup('service:metadata-schema');
    const schema = service.alpacafySchema(get(this, 'mockSchema'));
    const result = service.addDisplayData(schema, data, readonly);

    assert.ok(result, 'No result found');
    assert.ok(result.data, 'No data found in result');

    assert.ok(result.options.fields.name.readonly, "Property 'name' not marked as read only");
    assert.notOk(result.options.fields.feedback.readonly, "Property 'feedback' marked as read only");
  });

  test('Validation should fail when "name" field is not present in data', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    assert.notOk(service.validate(get(this, 'mockSchema'), {}), 'Should not validate');

    const errors = service.getErrors();
    assert.strictEqual(errors.length, 1, 'Should be 1 error');
    assert.strictEqual(errors[0].message, "should have required property 'name'");
  });

  test('Validation should fail when "ranking" value is something not in enum', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const data = {
      name: 'Moo Jones',
      ranking: 'invalid-moo',
    };

    assert.notOk(service.validate(get(this, 'mockSchema'), data), 'Validation should fail');

    const errors = service.getErrors();
    assert.strictEqual(errors.length, 1, 'Should have found 1 error');
  });

  test('Try validating bad ISSN info', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const data = {
      name: 'Moo Jones',
      ranking: 'moo',
      issns: [
        {
          issn: '1234',
          pubType: 'Electronic',
        },
      ],
    };

    assert.notOk(service.validate(get(this, 'mockSchema'), data), 'Validation should fail');

    const errors = service.getErrors();
    assert.strictEqual(errors.length, 1, 'Should have found 1 error');
  });

  test("Get fields includes 'allOf' properties", function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const result = service.getFields([get(this, 'mockSchema')]);

    assert.ok(result, 'No results found');
    assert.ok(result.includes('issns'));
  });

  test("Get fields does not include 'allOf' properties when told not to", function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const result = service.getFields([get(this, 'mockSchema')], true);

    assert.ok(result, 'No results found');
    assert.notOk(result.includes('issns'));
  });

  test('Get field to title map', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const result = service.getFieldTitleMap([get(this, 'mockSchema')]);

    assert.ok(result);
    assert.strictEqual(result.name, 'Full name');
    assert.strictEqual(result.feedback, 'Feedback');
    assert.strictEqual(result.issns, 'ISSNs', 'issns field from "allOf" block should be included');
  });

  test('Should format complex metadata', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const submission = EmberObject.create({
      repositories: [{ id: 0 }],
      metadata: JSON.stringify({
        issns: [{ issn: '123-moo' }, { issn: 'moo-321', pubType: 'Print' }],
      }),
    });

    const result = await service.displayMetadata(submission);
    const expected = [
      {
        label: 'ISSNs',
        isArray: true,
        value: [{ ISSN: '123-moo' }, { ISSN: 'moo-321 (Print)' }],
      },
    ];

    assert.deepEqual(result, expected);
  });

  test('Key not found in whitelist is not displayed', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const submission = EmberObject.create({
      repositories: [],
      metadata: JSON.stringify({ name: 'Bessie Cow' }),
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

  test('No backend request if no repositories are passed', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const serviceFetchFake = sinon.replace(service, '_fetchSchemas', sinon.fake());

    service.getMetadataSchemas([]);

    assert.ok(serviceFetchFake.notCalled, '_fetchSchemas should not have been called');
  });
});
