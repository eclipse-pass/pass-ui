import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | workflow-metadata2', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const repositories = Ember.A();
    const submission = Ember.Object.create({
      repositories
    });

    this.set('submission', submission);
    this.set('repositories', repositories);

    Object.defineProperty(window.navigator, 'userAgent', { value: 'Chrome', configurable: true });

    const mockSchemaService = Ember.Service.extend({
      getMetadataSchemas(repositories) {
        return Promise.resolve([
          {
            id: 'nih',
            data: {},
            schema: {
              title: 'NIH Manuscript Submission System (NIHMS) <br><p class="lead text-muted">The following metadata fields will be part of the NIHMS submission.</p>',
              type: 'object',
              properties: {
                'journal-NLMTA-ID': { type: 'string', required: true },
                ISSN: { type: 'string', required: true }
              }
            },
            options: {
              fields: {
                'journal-NLMTA-ID': { type: 'text', label: 'Journal NLMTA ID', placeholder: '' },
                ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
              }
            }
          },
          {
            id: 'jscholarship',
            data: {},
            schema: {
              title: 'JScholarship Moo',
              type: 'object',
              properties: {
                mooName: { type: 'string', required: true },
                ISSN: { type: 'string', required: true }
              }
            },
            options: {
              fields: {
                mooName: { type: 'text', label: 'Journal NLMTA ID', placeholder: '' },
                ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
              }
            }
          }
        ]);
      }
      // addDisplayData(schema, data, setReadOnly) { return {}; }
    });
    const mockBlobService = Ember.Service.extend({
      mergeBlobs(b1, b2) { return {}; }
    });

    run(() => {
      this.owner.unregister('service:metadata-schema');
      this.owner.unregister('service:metadata-blob');

      this.owner.register('service:metadata-schema', mockSchemaService);
      this.owner.register('service:metadata-blob', mockBlobService);
    });
  });

  test('it renders', function (assert) {
    const component = this.render(hbs`{{workflow-metadata2 submission=submission}}`);
    assert.ok(component);
  });

  test('');
});
