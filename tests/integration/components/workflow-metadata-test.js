import Service from '@ember/service';
import EmberObject, { get } from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import { getContext, click, render, fillIn, waitFor } from '@ember/test-helpers';

let submission;

module('Integration | Component | workflow-metadata', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const repositories = A();
    const journal = EmberObject.create({
      issns: []
    });
    const publication = EmberObject.create({
      journal
    });

    const subMetadata = {
      hints: {
        'collection-tags': ['covid']
      }
    };

    submission = EmberObject.create({
      repositories,
      publication,
      metadata: JSON.stringify(subMetadata)
    });

    this.set('submission', submission);
    this.set('repositories', repositories);
    this.set('publication', publication);

    Object.defineProperty(window.navigator, 'userAgent', { value: 'Chrome', configurable: true });

    const mockAjax = Service.extend({
      request() {
        return Promise.resolve([
          {
            id: 'common',
            definitions: {
              form: {
                title: 'Common schema title moo',
                type: 'object',
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
                  ISSN: { type: 'string' },
                  hints: {
                    additionalProperties: false,
                    description: 'Hints have semantics shared by the UI and the backend that are intended to influence the backend processing of the submission.',
                    properties: {
                      'collection-tags': {
                        items: {
                          type: 'string'
                        },
                        title: 'Tags impacting the collection used by Deposit Services for deposit',
                        type: 'array',
                        uniqueItems: true
                      }
                    },
                    title: 'Hints provided by the UI to backend services',
                    type: 'object'
                  }
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
                  mooName: { type: 'text', label: 'MOO Name', placeholder: '' },
                  ISSN: { type: 'text', label: 'ISSN', placeholder: '' }
                }
              }
            }
          }
        ]);
      }
    });

    const workflowService = this.owner.lookup('service:workflow');

    workflowService.set('doiInfo', {
      title: 'title',
      'journal-title': 'journal title',
      mooName: 'bessie',
      ISSN: ['abracadabra'],
      'journal-NLMTA-ID': 'triumph'
    });

    this.owner.register('service:ajax', mockAjax);
  });

  test('should render common schema', async function (assert) {
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('input[type=text]');

    assert.ok(this.element.textContent.includes('Common schema'));
  });

  test('should display current and total number of pages', async function (assert) {
    const expected = 'Form 1 of 3';

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    const header = this.element.querySelector('h4');
    assert.ok(header);
    assert.ok(header.textContent.includes(expected));
  });

  test('must show form nav buttons', async function (assert) {
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    const buttons = this.element.querySelectorAll('button');
    assert.equal(3, buttons.length, 'should be two buttons');

    Object.keys(buttons).map(key => buttons[key].textContent).forEach((btn) => {
      assert.ok(btn === 'Back' || btn === 'Next' || btn === 'Abort');
    });
  });

  test('second form should be NIHMS', async function (assert) {
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-key="Next"]');
    await click('button[data-key="Next"]');
    await waitFor('input[name="journal-NLMTA-ID"]');
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
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-key="Next"]');
    await click('button[data-key="Next"]');

    // Need to fill out ISSN field
    await waitFor('input[name="ISSN"]');
    this.element.querySelector('input[name="ISSN"]').value = '1234';

    await click('button[data-key="Next"]');
    await waitFor('input[name="ISSN"]');

    assert.ok(
      this.element.textContent.includes('JScholarship Moo'),
      'text in component should include "JScholarship"'
    );
  });

  test('improperly formatted hint will fail validation', async function (assert) {
    const badHintMetadata = {
      hints: {
        'collection-tags': [{
          thisAint: 'a string'
        }]
      }
    };

    submission.metadata = JSON.stringify(badHintMetadata);

    await render(hbs`{{workflow-metadata submission=submission publication=publication}}`);
    await waitFor('button[data-key="Next"]');
    await click('button[data-key="Next"]');

    // Need to fill out ISSN field
    await waitFor('input[name="ISSN"]');
    this.element.querySelector('input[name="ISSN"]').value = '1234';

    await click('button[data-key="Next"]');
    await waitFor('input[name="ISSN"]');

    await waitFor(document.querySelector('.swal2-confirm'));

    assert.dom(document.querySelector('.swal2-title')).includesText('Form Validation Error');
    assert.dom(document.querySelector('.swal2-content')).includesText('should be string');
    await click(document.querySelector('.swal2-confirm'));
  });

  test('Back button on J10P form takes you back to NIH form', async function (assert) {
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-key="Next"]');
    await click('button[data-key="Next"]');
    // Need to fill out ISSN field
    await waitFor('input[name="ISSN"]');
    this.element.querySelector('input[name="ISSN"]').value = '1234';

    await click('button[data-key="Next"]');
    await waitFor('button[data-key="Back"]');
    await click('button[data-key="Back"]');

    await waitFor('input[name="ISSN"]');

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

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-key="Next"]');

    // Set data in the inputs of Form 1
    await waitFor('input[name="ISSN"]');
    await fillIn('input[name="journal-NLMTA-ID"]', 'nlmta-id-moo');
    await fillIn('input[name="ISSN"]', expectedISSN);

    await click('button[data-key="Next"]');
    // Check to see if relevant data is pre-populated into Form 2
    await waitFor('input[name="ISSN"]');
    assert.dom('input[name="ISSN"]').hasValue(expectedISSN);
  });

  test('Should not proceed to 3rd form without ISSN specified', async function (assert) {
    // Validation should fail without doiInfo values.

    this.owner.unregister('service:workflow');
    this.owner.register('service:workflow', Service.extend({
      getDoiInfo: () => {},
      isDataFromCrossref: () => false
    }));

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-key="Next"]');
    await click('button[data-key="Next"]');

    await waitFor('input[name="ISSN"]');
    assert.ok(this.element.textContent.includes('NIHMS'), 'We should be on NIH form');
    this.element.querySelector('input[name="ISSN"]').value = '';

    await click('button[data-key="Next"]');
    await waitFor(document.querySelector('.swal2-confirm'));
    await click(document.querySelector('.swal2-confirm'));

    assert.ok(this.element.textContent.includes('NIHMS'), 'We should still be on NIH form');
  });

  module('test with mocked doi service', (hooks) => {
    hooks.beforeEach(function () {
      const mockDoiService = Service.extend({
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
      await render(hbs`
        <WorkflowMetadata
          @submission={{this.submission}}
          @publication={{this.publication}}
        />
      `);

      assert.ok(true, 'Failed to render');

      // On render, check the 'journal-NLMTA-ID' field value in UI
      await waitFor('input[name="journal-NLMTA-ID"]');
      const nlmtaInput = this.element.querySelector('input[name="journal-NLMTA-ID"]');
      assert.ok(nlmtaInput, 'NLMTA-ID input not found');
      assert.equal(
        nlmtaInput.value,
        'MOO JOURNAL',
        'Unexpected "journal-NLMTA-ID" value found'
      );

      await click('button[data-key="Next"]');
      await waitFor('button[data-key="Next"]');
      await click('button[data-key="Next"]');

      // On third form, check the 'mooName' field in the UI
      await waitFor('input[name="mooName"]');
      const mooInput = this.element.querySelector('input[name="mooName"]');
      assert.ok(mooInput, 'mooName input not found');
      assert.equal(
        mooInput.value,
        'This is a moo',
        'Unexpected value for "mooName" found'
      );
    });
  });

  test('DOI fields should be read-only, but non-DOI fields should be editable', async function (assert) {
    let sub = get(this, 'submission');
    sub.set('metadata', JSON.stringify({
      ISSN: '123Moo'
    }));
    this.set('submission', sub);

    const mockDoiService = Service.extend({
      doiToMetadata() {
        return {
          'journal-NLMTA-ID': 'MOO JOURNAL'
        };
      }
    });

    const mockWorkflow = Service.extend({
      getDoiInfo: () => {},
      isDataFromCrossref: () => true
    });

    this.owner.unregister('service:workflow');
    this.owner.register('service:workflow', mockWorkflow);
    this.owner.unregister('service:doi');
    this.owner.register('service:doi', mockDoiService);

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('input[name="journal-NLMTA-ID"]');
    const nlmtaInput = this.element.querySelector('input[name="journal-NLMTA-ID"]');
    assert.ok(nlmtaInput, 'NLMTA-ID input not found');
    assert.ok(
      nlmtaInput.hasAttribute('readonly') || nlmtaInput.hasAttribute('disabled'),
      'NLMTA-ID input was found to be editable'
    );
    assert.ok(nlmtaInput.value, 'MOO JOURNAL', 'Unexpected "NLMTA-ID" found');

    const issnInput = this.element.querySelector('input[name="ISSN"]');
    assert.ok(issnInput, 'ISSN input not found');
    assert.notOk(
      issnInput.hasAttribute('readonly') || issnInput.hasAttribute('disabled'),
      'ISSN input was read only, but should be editable'
    );
    assert.ok(issnInput.value, '123Moo', 'Unexpected ISSN value found');
  });

  /**
   * DOI data should have invalid keys removed when translated to the 'workflow-metadata'
   * metadata property. The mock Schema Service defined in #beforeEach above will define
   * a set of valid fields that does NOT include the property 'badMoo'. This property
   * then should not exist in the component's metadata blob.
   */
  test('DOI data should be trimmed', async function (assert) {
    const mockWorkflow = Service.extend({
      getDoiInfo() {
        return {
          ISSN: '1234-4321',
          'journal-NLMTA-ID': 'MOO JOURNAL',
          mooName: 'This is a moo',
          badMoo: 'Sad moo'
        };
      },
      isDataFromCrossref: () => false
    });

    this.owner.unregister('service:workflow');
    this.owner.register('service:workflow', mockWorkflow);

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    assert.ok(true, 'Failed to render');

    let { owner } = getContext();
    let component = owner.lookup('component:metadata-form');

    assert.notOk(get(component, 'metadata'), 'No component metadata found');
    assert.notOk(get(component, 'metadata.badMoo'), 'metadata.badMoo property should not be found on the metadata object');
  });

  test('Metadata merges should be able to remove fields', async function (assert) {
    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('input[name="journal-NLMTA-ID"]');
    const nlmtaIn = this.element.querySelector('input[name="journal-NLMTA-ID"]');
    assert.ok(nlmtaIn, 'No NLMTA-ID input field found');
    assert.ok(nlmtaIn.value.includes('triumph'), 'Unexpected value found for NLMTA-ID');

    await waitFor('input[name="journal-NLMTA-ID"]');
    await fillIn('input[name="journal-NLMTA-ID"]', '');
    await click('button[data-key="Next"]');

    await waitFor('input[name="journal-NLMTA-ID"]');
    assert.notOk(this.element.querySelector('input[name="journal-NLMTA-ID"]').value.includes('triumph'));
  });

  test('Single schema displays no title', async function (assert) {
    const mockAjax = Service.extend({
      request() {
        return Promise.resolve([
          {
            id: 'common',
            definitions: {
              form: {
                title: 'Common schema title moo',
                type: 'object',
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
          },
        ]);
      }
    });
    // Override previously mocked AJAX service
    this.owner.register('service:ajax', mockAjax);

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    const text = this.element.textContent;
    assert.notOk(text.includes('Common schema'), 'Schema title should not be displayed');
  });

  test('Check "required" labels for pre-populated array fields', async function (assert) {
    const mockDoiService = Service.extend({
      doiToMetadata() {
        return {
          moorray: [
            { reqField: 'Moo 1', optField: 'Optional-ish' },
            { reqField: 'Moo 2' }
          ]
        };
      }
    });
    const mockAjax = Service.extend({
      request() {
        return Promise.resolve([{
          id: 'moo',
          definitions: {
            form: {
              title: 'Test schema',
              type: 'object',
              properties: {
                moorray: {
                  type: 'array',
                  items: {
                    properties: {
                      reqField: { type: 'string' },
                      optField: { type: 'string' }
                    },
                    required: ['reqField']
                  }
                }
              },
              options: {
                fields: {
                  moorray: {
                    label: 'Array field',
                    items: {
                      fields: {
                        reqField: { label: 'This should be required' },
                        optField: { label: 'This is optional' }
                      }
                    }
                  }
                }
              },
              required: ['moorray']
            }
          }
        }]);
      }
    });

    this.owner.register('service:doi', mockDoiService);
    this.owner.register('service:ajax', mockAjax);

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('legend');
    assert.notOk(this.element.querySelector('legend').textContent.includes('required'));

    const reqIndicators = this.element.querySelectorAll('.alpaca-container-item .alpaca-required-indicator');
    assert.equal(reqIndicators.length, 2, '(required) indicator should appear only twice in rendered form');
  });

  test('Check "required" labels for user added array fields', async function (assert) {
    const mockAjax = Service.extend({
      request() {
        return Promise.resolve([{
          id: 'moo',
          definitions: {
            form: {
              title: 'Test schema',
              type: 'object',
              properties: {
                moorray: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      reqField: { type: 'string' },
                      optField: { type: 'string' }
                    },
                    required: ['reqField']
                  }
                }
              },
              options: {
                fields: {
                  moorray: {
                    label: 'Array field',
                    items: {
                      fields: {
                        reqField: { label: 'This should be required' },
                        optField: { label: 'This is optional' }
                      }
                    }
                  }
                }
              },
              required: ['moorray']
            }
          }
        }]);
      }
    });

    this.owner.register('service:ajax', mockAjax);

    await render(hbs`
      <WorkflowMetadata
        @submission={{this.submission}}
        @publication={{this.publication}}
      />
    `);

    await waitFor('button[data-alpaca-array-toolbar-action="add"]');
    const addBtn = this.element.querySelector('button[data-alpaca-array-toolbar-action="add"]');
    assert.ok(addBtn);

    await click(addBtn);

    assert.notOk(this.element.querySelector('legend').textContent.includes('required'));

    const reqIndicators = this.element.querySelectorAll('.alpaca-container-item .alpaca-required-indicator');
    assert.equal(reqIndicators.length, 1, '(required) indicator should appear only twice in rendered form');
  });
});
