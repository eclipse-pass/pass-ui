/* eslint-disable ember/no-classic-classes, ember/prefer-ember-test-helpers, ember/require-valid-css-selector-in-test-helpers */
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  click,
  currentURL,
  fillIn,
  focus,
  find,
  triggerEvent,
  triggerKeyEvent,
  visit,
  waitFor,
} from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sharedScenario from '../../mirage/scenarios/shared';
import { selectFiles } from 'ember-file-upload/test-support';

module('Acceptance | submission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({
      user: { id: '0' },
    });
  });

  test('can walk through an nih submission workflow and make a submission - base case', async function (assert) {
    sharedScenario(this.server);

    await visit('/app');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor('.flash-message.alert.alert-success');
    assert.dom('.flash-message.alert.alert-success').exists({ count: 1 });
    assert
      .dom('.flash-message.alert.alert-success')
      .includesText("We've pre-populated information from the DOI provided!");
    assert
      .dom('[data-test-article-title-text-area]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    assert.dom('[data-test-journal-name-input]').isDisabled();
    assert.dom('[data-test-article-title-text-area]').isDisabled();

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.strictEqual(currentURL(), '/submissions/new/grants');
    assert
      .dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.strictEqual(currentURL(), '/submissions/new/policies');
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.strictEqual(currentURL(), '/submissions/new/repositories');
    assert
      .dom('[data-test-workflow-repositories-required-list] li')
      .includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.strictEqual(currentURL(), '/submissions/new/metadata');
    assert
      .dom('[data-test-metadata-form] textarea[name=title]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    /**
     * At start of Files step, immediately click Next to make sure it won't
     * proceed without a file
     */
    await click('[data-test-workflow-files-next]');

    await waitFor('.flash-message.alert.alert-warning');
    assert.dom('.flash-message.alert.alert-warning').exists({ count: 1 });
    assert.dom('.flash-message.alert.alert-warning').includesText('At least one manuscript file is required');

    // TODO (Jared):
    // Resolve identity map problem that occurs in test when removing and adding
    // another file. This passes on the first run, but can be flakey locally in subsequent
    // runs.
    assert.strictEqual(currentURL(), '/submissions/new/files');

    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await selectFiles('input[type=file]', submissionFile);

    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.strictEqual(currentURL(), '/submissions/new/review');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('JScholarship');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('PubMed Central');
    assert
      .dom('[data-test-workflow-review-title]')
      .includesText(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert
      .dom('[data-test-workflow-review-grant-list] li')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');

    await click(document.querySelector('.swal2-modal').parentElement);
    assert.dom('#swal2-title').doesNotExist();

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');
    await click(document.querySelector('#swal2-checkbox'));
    await click(document.querySelector('.swal2-confirm'));

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Confirm submission');
    await click(document.querySelector('.swal2-confirm'));

    await waitFor('[data-test-workflow-thanks-thank-you]');
    assert.dom('[data-test-workflow-thanks-thank-you]').includesText('Thank you!');
    assert.ok(currentURL().includes('/thanks'));

    await click('[data-test-workflow-thanks-link-to-submissions]');
    assert.strictEqual(currentURL(), '/submissions');

    const submissionHref = '/submissions/2';
    await waitFor('[data-test-submissions-index-submissions-table]');
    await click(`table a[href="/app${submissionHref}"]`);

    assert.ok(currentURL().includes(submissionHref));
    assert.dom('[data-test-submission-detail-status]').includesText('submitted');
    assert.dom('[data-test-submission-detail-submitter]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-submitter]').includesText('( nihuser@jhu.edu )');

    await click('[data-test-navbar-grants-link]');
    await waitFor('td.projectname-column');
    assert.dom('td.projectname-column').exists({ count: 9 });
    assert.dom('td.projectname-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('td.funder-column').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert.dom('td.awardnum-column').includesText('R01EY012124');
    assert.dom(document.querySelector('tr > td:nth-child(5)')).includesText('2');
    assert.dom(document.querySelector('tr > td:nth-child(6)')).includesText('active');
    assert.dom(document.querySelector('tr > td:nth-child(7)')).includesText('no issues detected');

    await click('td.projectname-column a');

    await waitFor('[data-test-grants-detail-name]');
    assert.dom('[data-test-grants-detail-name]').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-grants-detail-award-number]').includesText('R01EY012124');
    assert.dom('[data-test-grants-detail-funder]').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert
      .dom(document.querySelector('tr:nth-child(3) > td:nth-child(1)'))
      .includesText('Quantitative profiling of carbonyl');
    assert.dom(document.querySelector('tr:nth-child(3) > td:nth-child(2)')).includesText('R01EY012124');
    assert.dom(document.querySelector('tr:nth-child(3) > td:nth-child(3)')).includesText('PubMed Central');
    assert.dom(document.querySelector('tr:nth-child(3) > td:nth-child(5)')).includesText('submitted');
    assert.dom(document.querySelector('tr:nth-child(3) > td:nth-child(6)')).includesText('Not available');
  });

  test('stop submission midway and confirm some details are saved then finish submission', async function (assert) {
    sharedScenario(this.server);

    await visit('/app');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();

    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor('.flash-message.alert.alert-success');
    assert.dom('.flash-message.alert.alert-success').exists({ count: 1 });
    assert
      .dom('.flash-message.alert.alert-success')
      .includesText("We've pre-populated information from the DOI provided!");

    assert
      .dom('[data-test-article-title-text-area]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    assert.dom('[data-test-journal-name-input]').isDisabled();
    assert.dom('[data-test-article-title-text-area]').isDisabled();

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.strictEqual(currentURL(), '/submissions/new/grants');
    assert
      .dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await click('[data-test-navbar-submissions-link]');
    await click('[data-test-navbar-submissions-link]');

    assert.strictEqual(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');

    const rowForSubmission = 'table tbody tr:nth-child(3)';
    assert.dom(`${rowForSubmission} td:nth-child(5)`).includesText('draft');
    await click(`${rowForSubmission} td a`);

    assert.ok(currentURL().includes('/submissions/2'));
    assert.dom('[data-test-submission-detail-status]').includesText('draft');
    assert.dom('[data-test-submission-detail-funder]').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-submission-detail-grant]').includesText('R01EY012124');

    await click('[data-test-submission-detail-edit-submission]');

    const fragment = 'submission=2';

    assert.ok(currentURL().includes(`/submissions/new/basics?${fragment}`));
    assert
      .dom('[data-test-article-title-text-area]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    await waitFor('[data-test-journal-name-input]');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.ok(currentURL().includes(`/submissions/new/grants?${fragment}`));
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.ok(currentURL().includes(`/submissions/new/policies?${fragment}`));
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.ok(currentURL().includes(`/submissions/new/repositories?${fragment}`));
    assert
      .dom('[data-test-workflow-repositories-required-list] li')
      .includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.ok(currentURL().includes(`/submissions/new/metadata?${fragment}`));
    assert
      .dom('[data-test-metadata-form] textarea[name=title]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.ok(currentURL().includes(`/submissions/new/files?${fragment}`));
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent('input[type=file]', 'change', { files: [submissionFile] });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.ok(currentURL().includes(`/submissions/new/review?${fragment}`));
    assert
      .dom('[data-test-workflow-review-title]')
      .includesText(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert
      .dom('[data-test-workflow-review-grant-list] li')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');

    await click(document.querySelector('.swal2-modal').parentElement);
    assert.dom('#swal2-title').doesNotExist();

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');
    await click(document.querySelector('#swal2-checkbox'));
    await click(document.querySelector('.swal2-confirm'));

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Confirm submission');
    await click(document.querySelector('.swal2-confirm'));

    await waitFor('[data-test-workflow-thanks-thank-you]');
    assert.dom('[data-test-workflow-thanks-thank-you]').includesText('Thank you!');
    assert.ok(currentURL().includes('/thanks'));

    await click('[data-test-workflow-thanks-link-to-submissions]');
    assert.strictEqual(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click(`${rowForSubmission} td a`);
    assert.ok(currentURL().includes('/submissions/2'));
    assert.dom('[data-test-submission-detail-status]').includesText('submitted');
    assert.dom('[data-test-submission-detail-submitter]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-submitter]').includesText('( nihuser@jhu.edu )');
  });

  test('reset DOI part way through submission', async function (assert) {
    sharedScenario(this.server);

    await visit('/app');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor('.flash-message.alert.alert-success');
    assert.dom('.flash-message.alert.alert-success').exists({ count: 1 });
    assert
      .dom('.flash-message.alert.alert-success')
      .includesText("We've pre-populated information from the DOI provided!");

    assert
      .dom('[data-test-article-title-text-area]')
      .hasValue(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    // Make sure inputs for title and journal are not accepted
    assert.dom('[data-test-journal-name-input]').isDisabled();
    assert.dom('[data-test-article-title-text-area]').isDisabled();

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.strictEqual(currentURL(), '/submissions/new/grants');
    assert
      .dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');
    await waitFor('[data-test-workflow-policies-back]');
    await click('[data-test-workflow-policies-back]');
    await waitFor('[data-test-workflow-grants-back]');
    await click('[data-test-workflow-grants-back]');

    await waitFor('[data-test-doi-input]');
    await fillIn('[data-test-doi-input]', '');
    await fillIn('[data-test-article-title-text-area]', 'My article');

    await click('.ember-power-select-trigger');
    await fillIn('.ember-power-select-search-input', 'The Analyst');
    await click('.ember-power-select-option');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.strictEqual(currentURL(), '/submissions/new/grants');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.strictEqual(currentURL(), '/submissions/new/policies');
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.strictEqual(currentURL(), '/submissions/new/repositories');
    assert
      .dom('[data-test-workflow-repositories-required-list] li')
      .includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.strictEqual(currentURL(), '/submissions/new/metadata');

    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('My article');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor(document.querySelector('#swal2-content'));
    assert.dom(document.querySelector('#swal2-content')).includesText("should have required property 'author'");

    // Some reason, setting the document query to a variable before clicking works,
    // but calling the query selector in the click does not work
    const confirmBtn = document.querySelector('.swal2-confirm');
    assert.ok(confirmBtn);
    await waitFor(confirmBtn);
    await click(confirmBtn);

    const addAuthorBtn = document.querySelectorAll('.alpaca-array-toolbar-action').item(1);
    assert.ok(addAuthorBtn);
    await click(addAuthorBtn);

    await waitFor('input[name=authors_0_author]');
    await fillIn('input[name=authors_0_author]', 'John Moo');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.strictEqual(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent('input[type=file]', 'change', { files: [submissionFile] });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.strictEqual(currentURL(), '/submissions/new/review');

    assert.dom('[data-test-workflow-review-title]').includesText('My article');
    assert
      .dom('[data-test-workflow-review-grant-list] li')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');

    await click(document.querySelector('.swal2-modal').parentElement);
    assert.dom('#swal2-title').doesNotExist();

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');
    await click(document.querySelector('#swal2-checkbox'));
    await click(document.querySelector('.swal2-confirm'));

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Confirm submission');
    await click(document.querySelector('.swal2-confirm'));

    await waitFor('[data-test-workflow-thanks-thank-you]');
    assert.dom('[data-test-workflow-thanks-thank-you]').includesText('Thank you!');
    assert.ok(currentURL().includes('/thanks'));
  });

  test('opt out of PMC policy', async function (assert) {
    sharedScenario(this.server);

    await visit('/app');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentURL(), '/submissions/new/basics');

    await waitFor('[data-test-doi-input]');
    await fillIn('[data-test-doi-input]', '');
    await fillIn('[data-test-article-title-text-area]', 'My article');

    await click('.ember-power-select-trigger');
    await fillIn('.ember-power-select-search-input', 'The Analyst');
    await click('.ember-power-select-option');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.strictEqual(currentURL(), '/submissions/new/grants');
    assert
      .dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert
      .dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.strictEqual(currentURL(), '/submissions/new/policies');

    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');
    await click('[data-test-workflow-policies-radio-direct-deposit]');
    await waitFor('[data-test-workflow-policies-radio-direct-deposit]');
    assert.dom('[data-test-workflow-policies-radio-direct-deposit:checked]');

    /**
     * Mock the response from the policy service for getting repositories
     * Reset the Mirage namespace here will only apply to this mock
     */
    this.server.namespace = '';
    this.server.get('/policy/repositories', () => ({
      required: [],
      'one-of': [],
      optional: [
        {
          url: '1',
          selected: true,
        },
      ],
    }));

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');

    assert.strictEqual(currentURL(), '/submissions/new/repositories');
    assert.dom('[data-test-workflow-repositories-required-list] li').doesNotExist();
    assert
      .dom('[data-test-workflow-repositories-optional-list]')
      .doesNotIncludeText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.strictEqual(currentURL(), '/submissions/new/metadata');

    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('My article');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');
    assert.dom('[data-test-metadata-form] input[name=journal-NLMTA-ID]').doesNotExist();

    await click('.alpaca-form-button-Next');

    await waitFor(document.querySelector('#swal2-content'));
    assert.dom(document.querySelector('#swal2-content')).includesText("should have required property 'author'");

    const confirmBtn = document.querySelector('.swal2-confirm');
    assert.ok(confirmBtn, 'No SweetAlert OK button found');
    await waitFor(confirmBtn);
    await click(confirmBtn);

    const addAuthorBtn = document.querySelectorAll('.alpaca-array-toolbar-action').item(1);
    assert.ok(addAuthorBtn, "Couldn't find the Add Author button");
    await click(addAuthorBtn);

    await waitFor('input[name=authors_0_author]');
    await fillIn('input[name=authors_0_author]', 'John Moo');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.strictEqual(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent('input[type=file]', 'change', { files: [submissionFile] });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.strictEqual(currentURL(), '/submissions/new/review');

    assert.dom('[data-test-workflow-review-repository-list]').doesNotIncludeText('PubMed Central');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('JScholarship');
    assert.dom('[data-test-workflow-review-title]').includesText('My article');
    assert
      .dom('[data-test-workflow-review-grant-list] li')
      .includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');

    await click(document.querySelector('.swal2-modal').parentElement);
    assert.dom('#swal2-title').doesNotExist();

    await click('[data-test-workflow-review-submit]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Deposit requirements for JScholarship');
    await click(document.querySelector('#swal2-checkbox'));
    await click(document.querySelector('.swal2-confirm'));

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('Confirm submission');
    await click(document.querySelector('.swal2-confirm'));

    await waitFor('[data-test-workflow-thanks-thank-you]');
    assert.dom('[data-test-workflow-thanks-thank-you]').includesText('Thank you!');
    assert.ok(currentURL().includes('/thanks'));
  });
});
