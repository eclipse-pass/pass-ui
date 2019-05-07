import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import { click, render } from '@ember/test-helpers';

module('Integration | Component | workflow-metadata', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const repositories = Ember.A();
    const submission = Ember.Object.create({
      repositories
    });

    this.set('submission', submission);
    this.set('repositories', repositories);

    Object.defineProperty(window.navigator, 'userAgent', { value: 'Chrome', configurable: true });

    const mockAjax = Ember.Service.extend({
      request() {
        return Promise.resolve([
          {
            id: 'common',
            definitions: {
              form: {
                title: 'Common schema title moo',
                properties: {
                  'journal-NLMTA-ID': { type: 'string' },
                  ISSN: { type: 'string' }
                },
                options: {
                  fields: {
                    'journal-NLMTA-ID': { type: 'text', label: 'Journal NLMTA ID', placeholder: '' },
                    ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
                  }
                }
              }
            }
          }, // Fake "global" schema that is returned by the service
          {
            id: 'nih',
            definitions: {
              form: {
                title: 'NIH Manuscript Submission System (NIHMS) <br><p class="lead text-muted">The following metadata fields will be part of the NIHMS submission.</p>',
                type: 'object',
                properties: {
                  'journal-NLMTA-ID': { type: 'string' },
                  ISSN: { type: 'string' }
                },
                // required: ['ISSN']
              },
              options: {
                fields: {
                  'journal-NLMTA-ID': { type: 'text', label: 'Journal NLMTA ID', placeholder: '' },
                  ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
                }
              }
            },
            allOf: [
              {
                properties: {
                  ISSN: { type: 'string' }
                },
                required: ['ISSN']
              }
            ]
          },
          {
            id: 'jscholarship',
            definitions: {
              form: {
                title: 'JScholarship Moo',
                type: 'object',
                properties: {
                  mooName: { type: 'string' },
                  ISSN: { type: 'string' },
                  issns: {
                    type: 'array',
                    items: {
                      properties: {
                        issn: { type: 'string' },
                        pubType: { type: 'string', enum: ['Print', 'Online'] }
                      },
                      type: 'object'
                    }
                  }
                },
                required: ['issns']
              },
              options: {
                fields: {
                  mooName: { type: 'text', label: 'Journal NLMTA ID', placeholder: '' },
                  ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
                }
              }
            }
          }
        ]);
      }
    });

    this.owner.register('service:ajax', mockAjax);
  });

  test('it renders', (assert) => {
    const component = render(hbs`{{workflow-metadata submission=submission}}`);
    assert.ok(component);
  });

  test('should render common schema', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);
    assert.ok(this.element.textContent.includes('Common schema'));
  });

  test('should display current and total number of pages', async function (assert) {
    const expected = 'Form 1 of 3';
    await render(hbs`{{workflow-metadata submission=submission}}`);

    const header = this.element.querySelector('h4');
    assert.ok(header);
    assert.ok(header.textContent.includes(expected));
  });

  test('must show form nav buttons', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);

    const buttons = this.element.querySelectorAll('button');
    assert.equal(3, buttons.length, 'should be two buttons');

    Object.keys(buttons).map(key => buttons[key].textContent).forEach((btn) => {
      assert.ok(btn === 'Back' || btn === 'Next' || btn === 'Abort');
    });
  });

  test('second form should be NIHMS', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);
    await click('button[data-key="Next"]');

    assert.ok(
      this.element.textContent.includes('NIH Manuscript Submission System'),
      'NIHMS header not found'
    );
    assert.ok(
      this.element.querySelector('input[name="journal-NLMTA-ID"]'),
      'journal-NLMTA-ID input field not found'
    );
  });

  test('third form should be J10P', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);
    await click('button[data-key="Next"]');

    // Need to fill out ISSN field
    this.element.querySelector('input[name="ISSN"]').value = '1234';

    await click('button[data-key="Next"]');

    assert.ok(
      this.element.textContent.includes('JScholarship Moo'),
      'text in component should include "JScholarship"'
    );
  });

  test('Back button on J10P form takes you back to NIH form', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);
    await click('button[data-key="Next"]');
    // Need to fill out ISSN field
    this.element.querySelector('input[name="ISSN"]').value = '1234';

    await click('button[data-key="Next"]');
    await click('button[data-key="Back"]');

    assert.ok(
      this.element.textContent.includes('NIH Manuscript Submission System'),
      'NIHMS header not found, we\'re supposed to have the NIH form rendered now'
    );
  });

  /**
   * Since the required service is mocked, we should either defer to the service unit test,
   * or do this test in an acceptance test
   */
  test('Test autofilling form fields', async function (assert) {
    const expectedISSN = '123moo321';

    await render(hbs`{{workflow-metadata submission=submission}}`);
    await click('button[data-key="Next"]');

    // Set data in the inputs of Form 1
    this.element.querySelector('input[name="journal-NLMTA-ID"]').value = 'nlmta-id-moo';
    this.element.querySelector('input[name="ISSN"]').value = expectedISSN;

    await click('button[data-key="Next"]');
    // Check to see if relevant data is pre-populated into Form 2
    const issnInput = this.element.querySelector('input[name="ISSN"]');
    assert.ok(issnInput, 'No ISSN input found');
    assert.equal(
      issnInput.value,
      expectedISSN,
      'ISSN from Form 1 should appear in Form 2'
    );
  });

  test('Should not proceed to 3rd form without ISSN specified', async function (assert) {
    await render(hbs`{{workflow-metadata submission=submission}}`);
    await click('button[data-key="Next"]');
    // debugger
    assert.ok(this.element.textContent.includes('NIHMS'), 'We should be on NIH form');

    await click('button[data-key="Next"]');
    // debugger
    assert.ok(this.element.textContent.includes('NIHMS'), 'We should still be on NIH form');
  });

  module('test with mocked doi service', (hooks) => {
    hooks.beforeEach(function () {
      const mockDoiService = Ember.Service.extend({
        doiToMetadata() {
          return {
            ISSN: '1234-4321',
            'journal-NLMTA-ID': 'MOO JOURNAL',
            mooName: 'This is a moo'
          };
        }
      });

      run(() => {
        this.owner.unregister('service:doi');
        this.owner.register('service:doi', mockDoiService);
      });
    });

    test('DOI info should autofill into forms', async function (assert) {
      await render(hbs`{{workflow-metadata submission=submission}}`);
      assert.ok(true, 'Failed to render');

      // On render, check the 'journal-NLMTA-ID' field value in UI
      const nlmtaInput = this.element.querySelector('input[name="journal-NLMTA-ID"]');
      assert.ok(nlmtaInput, 'NLMTA-ID input not found');
      assert.equal(
        nlmtaInput.value,
        'MOO JOURNAL',
        'Unexpected "journal-NLMTA-ID" value found'
      );

      await click('button[data-key="Next"]');
      await click('button[data-key="Next"]');

      // On third form, check the 'mooName' field in the UI
      const mooInput = this.element.querySelector('input[name="mooName"]');
      assert.ok(mooInput, 'mooName input not found');
      assert.equal(
        mooInput.value,
        'This is a moo',
        'Unexpected value for "mooName" found'
      );
    });
  });

  /**
   * DOI data should have invalid keys removed when translated to the 'workflow-metadata'
   * metadata property. The mock Schema Service defined in #beforeEach above will define
   * a set of valid fields that does NOT include the property 'badMoo'. This property
   * then should not exist in the component's metadata blob.
   */
  test('DOI data should be trimmed', async function (assert) {
    const mockWorkflow = Ember.Service.extend({
      getDoiInfo() {
        return {
          ISSN: '1234-4321',
          'journal-NLMTA-ID': 'MOO JOURNAL',
          mooName: 'This is a moo',
          badMoo: 'Sad moo'
        };
      }
    });

    run(async () => {
      this.owner.unregister('service:workflow');
      this.owner.register('service:workflow', mockWorkflow);

      await render(hbs`{{workflow-metadata submission=submission }}`);
      assert.ok(true, 'Failed to render');

      const component = this.owner.lookup('component:workflow-metadata');
      const metadata = component.get('metadata');

      assert.ok(metadata, 'No component metadata found');
      assert.notOk(metadata.badMoo, 'metadata.badMoo property should not be found on the metadata object');
    });
  });
});
