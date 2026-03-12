import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | workflow wrapper', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const submission = {};
    const publication = {};
    const submissionEvent = {};

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submissionEvents', [submissionEvent]);
    this.set('validateAndLoadTab', () => {});
    this.set('updateCovidSubmission', () => {});

    await render(hbs`<WorkflowWrapper
  @submission={{this.submission}}
  @publication={{this.publication}}
  @submissionEvents={{this.submissionEvents}}
  @loadTab={{this.validateAndLoadTab}}
  @updateCovidSubmission={{this.updateCovidSubmission}}
/>`);
    assert.ok(true);
  });
});
