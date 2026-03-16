import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';
import type AppStore from 'pass-ui/services/store';
import type RepositoryModel from 'pass-ui/models/repository';
import type SubmissionModel from 'pass-ui/models/submission';

module('Unit | Service | metadata-schema', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  test('Test get unknown schemas', function (assert) {
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;
    const store = this.owner.lookup('service:store') as AppStore;
    const repo = store.createRecord('repository', { schemas: ['moo', 'too'] }) as RepositoryModel;

    const result = service.getMetadataSchema([repo]);

    assert.ok(result, 'No result found');
    assert.equal(result!.elements.length, 0, 'Found elements');
  });

  test('Test get schema with readonly fields', function (assert) {
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;
    const store = this.owner.lookup('service:store') as AppStore;

    const readonly = ['title', 'issns'];
    const repo = store.createRecord('repository', { schemas: ['common', 'jscholarship'] }) as RepositoryModel;

    const result = service.getMetadataSchema([repo], readonly);

    assert.ok(result, 'No result found');

    for (const field of readonly) {
      const element = result!.elements.find((e: { name: string; readOnly?: boolean }) => e.name === field);

      assert.ok(element, `Field ${field} should be found`);
      assert.ok(element!.readOnly, `Field ${field} should be readonly`);
    }
  });

  test('Get field to title map', function (assert) {
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;

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
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;
    const submission = {
      repositories: [{ id: 0 }],
      metadata: JSON.stringify({
        issns: [{ issn: '123-moo' }, { issn: 'moo-321', pubType: 'Print' }],
      }),
    } as unknown as SubmissionModel;

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
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;
    const submission = {
      repositories: [],
      metadata: JSON.stringify({ name: 'Bessie Cow' }),
    } as unknown as SubmissionModel;

    const result = await service.displayMetadata(submission);
    const expected: unknown[] = [];

    assert.deepEqual(result, expected);
  });

  test('No result if no repositories passed', async function (assert) {
    const service = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;

    const result = service.getMetadataSchema([]);

    assert.equal(result!.elements.length, 0, 'Should have no result');
  });
});
