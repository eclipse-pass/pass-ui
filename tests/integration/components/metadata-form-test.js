import { moduleForComponent, test, setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';


module('Integration | Component | metadata-form', (hooks) => {
  setupRenderingTest(hooks);
  test('it renders', function (assert) {
    let model = {};

    // TODO: add actual tests here
    model = Ember.Object.create({
      metadata: '[]'
    });
    let schema = {
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
    this.set('model', model);

    let doiInfo = [];
    this.set('doiInfo', doiInfo);
    let currentFormStep = 0;
    this.set('currentFormStep', currentFormStep);

    render(hbs`{{metadata-form schema=schema model=model doiInfo=doiInfo currentFormStep=currentFormStep}}`);
    assert.ok(true);
  });
});
