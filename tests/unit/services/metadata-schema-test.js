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
            name: { type: 'string' },
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
              items: {
                properties: { issn: { type: 'string' }, pubType: { type: 'string', enum: ['Print', 'Online'] } },
                type: 'object'
              }
            }
          },
          required: ['name', 'ranking']
        }
      ]
    };
    this.set('mockSchema', mockSchema);

    const mockAjax = Ember.Service.extend({
      request() {
        // return Promise.resolve({ data: 'This is a moo' });
        return Promise.resolve(mockSchema);
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
        assert.ok(result.definitions, 'mockSchema.definitions not found');
      });
  });

  test('Alpacafication works as expected', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    service.getMetadataSchemas(['moo', 'two']).then((schema) => {
      const alpa = service.alpacafySchema(schema);
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

    const service = this.owner.lookup('service:metadata-schema');
    const schema = service.alpacafySchema(this.get('mockSchema'));
    const result = service.addDisplayData(schema, data, true);

    assert.ok(result, 'No result found');
    assert.ok(result.data, 'No data found in result');

    assert.ok(result.options.fields.name.readonly, 'Property \'name\' not marked as read only');
    assert.ok(result.options.fields.feedback.readonly, 'Property \'feedback\' not marked as read only');
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
});
