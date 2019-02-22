import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Service | metadata-schema', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const mockSchema = {
      schema: {
        title: ' User Feedback',
        description: 'What do you think about Alpaca?',
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name', required: true },
          feedback: { type: 'string', title: 'Feedback' },
          ranking: { type: 'string', title: 'Ranking', enum: ['excellent', 'ok'], required: true } // eslint-disable-line
        }
      },
      options: {
        form: {
          attributes: { action: 'http://httpbin.org/post', method: 'post' },
          buttons: { submit: {} }
        },
        helper: 'Tell us what you think about Alpaca!',
        fields: {
          name: { size: 20, helper: 'Please enter your name.' },
          feedback: {
            type: 'textarea',
            name: 'your_feedback',
            rows: 5,
            cols: 40,
            helper: 'Please enter your feedback.'
          },
          ranking: { type: 'select', helper: 'Select your ranking.', optionLabels: ['Awesome!', 'It\'s Ok'] }
        }
      }
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

  test('it exists', function (assert) {
    assert.ok(this.owner.lookup('service:metadata-schema'));
  });

  /**
   * Simple test showing that #getMetadataSchema uses the AJAX service to retrieve a
   * set of schema
   */
  test('Test against mocked AJAX', function (assert) {
    this.owner.lookup('service:metadata-schema').getMetadataSchemas(['moo', 'too'])
      .then((result) => {
        assert.ok(result, 'No result found');
        assert.ok(result.schema, 'mockSchema.schema not found');
        assert.ok(result.options, 'mockSchema.options not found');
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

    const result = this.owner.lookup('service:metadata-schema').addDisplayData(this.get('mockSchema'), data);

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

    const result = this.owner.lookup('service:metadata-schema').addDisplayData(this.get('mockSchema'), data, true);

    assert.ok(result, 'No result found');
    assert.ok(result.data, 'No data found in result');

    assert.ok(result.options.fields.name.readonly, 'Property \'name\' not marked as read only');
    assert.ok(result.options.fields.feedback.readonly, 'Property \'feedback\' not marked as read only');
  });
});
