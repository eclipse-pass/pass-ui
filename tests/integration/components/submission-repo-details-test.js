import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submission repo details', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Template usage:
    await render(hbs`<SubmissionRepoDetails />`);
    assert.ok(true);
  });

  test('renders deposit status message when present on failed', async function (assert) {
    this.set('submission', EmberObject.create({ submitted: true }));
    this.set('deposit', EmberObject.create({ depositStatus: 'failed', statusMessage: 'test-status-message' }));

    await render(hbs`<SubmissionRepoDetails @deposit={{this.deposit}} @submission={{this.submission}} />`);
    assert
      .dom('span.failed')
      .hasAttribute(
        'tooltip',
        'The system failed to receive the files for this submission. Message: test-status-message. Please try again by starting a new submission',
      );
  });

  test('does not render deposit status message when not present on failed', async function (assert) {
    this.set('submission', EmberObject.create({ submitted: true }));
    this.set('deposit', EmberObject.create({ depositStatus: 'failed' }));

    await render(hbs`<SubmissionRepoDetails @deposit={{this.deposit}} @submission={{this.submission}} />`);
    assert
      .dom('span.failed')
      .hasAttribute(
        'tooltip',
        'The system failed to receive the files for this submission. Please try again by starting a new submission',
      );
  });

  test('renders deposit status message when present on retry', async function (assert) {
    this.set('submission', EmberObject.create({ submitted: true }));
    this.set('deposit', EmberObject.create({ depositStatus: 'retry' }));

    await render(hbs`<SubmissionRepoDetails @deposit={{this.deposit}} @submission={{this.submission}} />`);
    assert
      .dom('span.retry')
      .hasAttribute(
        'tooltip',
        'The system failed to connect to the target repository. The deposit will be automatically retried later.',
      );
  });
});
