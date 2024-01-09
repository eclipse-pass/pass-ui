/* eslint-disable ember/no-classic-classes, ember/prefer-ember-test-helpers, ember/require-valid-css-selector-in-test-helpers */
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL, fillIn, find, triggerEvent, visit, waitFor } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sharedScenario from '../../mirage/scenarios/shared';

module('Acceptance | submission-details | Review ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    /**
     * Create the user in the database with both top level attrs and
     * attrs inside _source for the adapter to process elastic response
     */
    let attrs = {
      displayName: 'Staff Hasgrants',
      email: 'staffWithGrants@jhu.edu',
      firstName: 'Staff',
      lastName: 'Hasgrants',
      locatorIds: [
        `johnshopkins.edu:jhed:${Math.ceil(Math.random() * 1000000)}`,
        `johnshopkins.edu:hopkinsid:${Math.ceil(Math.random() * 1000000)}`,
        `johnshopkins.edu:employeeid:${Math.ceil(Math.random() * 1000000)}`,
        `johnshopkins.edu:jhed:${Math.ceil(Math.random() * 1000000)}`,
      ],
      roles: ['submitter'],
      username: 'staff1@johnshopkins.edu',
    };

    this.server.create('user', attrs);

    this.server.create('funder', {
      id: '4',
      localKey: 'moo.edu:funder:12341234',
      name: 'US Department of Education',
      policyId: '2',
    });

    this.server.create('grant', {
      id: '9',
      piId: '0',
      directFunderId: '4',
      primaryFunderId: '4',
      endDate: '2013-07-31T00:00:00.000Z',
      awardDate: '2008-11-24T00:00:00.000Z',
      startDate: '2008-12-01T00:00:00.000Z',
      awardStatus: 'active',
      awardNumber: 'MOO234',
      projectName: 'This is a moo, used by the Department of Education',
      localKey: `johnshopkins.edu:grant:12345`,
    });

    await authenticateSession({
      user: { id: '0' },
    });
  });

  test('Proxy submission review on submission details with web-link repos', async function (assert) {
    sharedScenario(this.server);

    await visit('/app');

    await waitFor('[data-test-start-new-submission]');
    await click(find('[data-test-start-new-submission]'));

    await click('[data-test-proxy-radio-button]');
    await fillIn('[data-test-proxy-search-input]', 'Staff');
    await click('[data-test-proxy-user-search-button]');

    await waitFor(document.querySelector('.ember-modal-dialog'));
    await waitFor(document.querySelector('[data-test-found-proxy-user]'));
    await click(document.querySelector('[data-test-found-proxy-user]'));

    // ================================================================================================

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

    await click('[data-test-workflow-files-next]');

    await waitFor(document.querySelector('#swal2-title'));
    assert.dom(document.querySelector('#swal2-title')).includesText('No manuscript present');
    await click(document.querySelector('.swal2-confirm'));
    assert.dom('#swal2-title').doesNotExist();

    await waitFor('[data-test-workflow-review-submit]');
    assert.strictEqual(currentURL(), '/submissions/new/review');

    await click('[data-test-workflow-review-back]');

    await waitFor('input[type=file]');

    assert.strictEqual(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent('input[type=file]', 'change', { files: [submissionFile] });
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');

    assert.strictEqual(currentURL(), '/submissions/new/review');
    assert
      .dom('[data-test-workflow-review-title]')
      .includesText(
        'Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS'
      );
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');
    assert.dom('[data-test-workflow-review-submitter]').includesText('This submission is prepared on behalf of');

    await click('[data-test-workflow-review-submit]');

    await waitFor('[data-test-workflow-thanks-thank-you]');
    assert.dom('[data-test-workflow-thanks-thank-you]').includesText('Thank you!');
    assert.ok(currentURL().includes('/thanks'));

    await click('[data-test-workflow-thanks-link-to-submissions]');
    assert.strictEqual(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click('table > tbody > tr:nth-child(3) > td > a');

    assert.ok(currentURL().includes('/submissions/2'));
    assert.dom('[data-test-submission-detail-status]').includesText('approval requested');

    assert.dom('[data-test-submission-detail-submitter]').includesText('Staff Hasgrants');
    assert.dom('[data-test-submission-detail-submitter]').includesText('( staffWithGrants@jhu.edu )');
    assert.dom('[data-test-submission-detail-preparer]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-preparer]').includesText('( nihuser@jhu.edu )');
  });
});
