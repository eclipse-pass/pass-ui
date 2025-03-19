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

  test('Test get unknown schemas', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const store = this.owner.lookup('service:store');
    const repo = store.createRecord('repository', { schemas: ['moo', 'too'] });

    const result = service.getMetadataSchema([repo]);

    assert.ok(result, 'No result found');
    assert.equal(result.elements.length, 0, 'Found elements');
  });

  test('Test get schema with readonly fields', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');
    const store = this.owner.lookup('service:store');

    const readonly = ['title', 'issns'];
    const repo = store.createRecord('repository', { schemas: ['common', 'jscholarship'] });

    const result = service.getMetadataSchema([repo], readonly);

    assert.ok(result, 'No result found');

    for (const field of readonly) {
      const element = result.elements.find((e) => e.name === field);

      assert.ok(element, `Field ${field} should be found`);
      assert.ok(element.readOnly, `Field ${field} should be readonly`);
    }
  });

  test('Get field to title map', function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const result = service.getFieldTitleMap({
      elements: [
        { name: 'name', title: 'Full name' },
        { name: 'feedback', title: 'Feedback' },
      ],
    });

    assert.ok(result);
    assert.strictEqual(result.name, 'Full name');
    assert.strictEqual(result.feedback, 'Feedback');
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
        label: 'ISSN Information',
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

  test('No result if no repositories passed', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema');

    const result = service.getMetadataSchema([]);

    assert.equal(result.elements.length, 0, 'Should have no result');
  });
});
