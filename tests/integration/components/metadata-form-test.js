import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | metadata-form', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const schema = {
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
    };
    this.set('schema', schema);
  });

  test('it renders', async function (assert) {
    await this.render(hbs`{{metadata-form schema=schema}}`);

    const el = this.element.querySelector('#schemaForm');
    assert.ok(el);

    assert.equal(
      3,
      el.querySelectorAll('button').length,
      'There should be three form control buttons (prev, abort, next)'
    );
  });
});
