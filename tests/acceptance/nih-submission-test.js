import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  find,
  click,
  visit,
  currentURL,
  fillIn,
  waitFor,
  triggerKeyEvent,
  triggerEvent
} from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sharedScenario from '../../mirage/scenarios/shared';

module('Acceptance | submission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const mockStaticConfig = Service.extend({
      getStaticConfig: () => Promise.resolve({
        branding: {
          stylesheet: '',
          pages: {}
        }
      }),
      addCss: () => {}
    });

    this.server.get('https://pass.local/downloadservice/lookup', () => ({
      manuscripts: [
        {
          url: 'https://dash.harvard.edu/bitstream/1/12285462/1/Nanometer-Scale%20Thermometry.pdf',
          repositoryLabel: 'Harvard University - Digital Access to Scholarship at Harvard (DASH)',
          type: 'application/pdf',
          source: 'Unpaywall',
          name: 'Nanometer-Scale Thermometry.pdf'
        },
        {
          url: 'http://europepmc.org/articles/pmc4221854?pdf=render',
          repositoryLabel: 'pubmedcentral.nih.gov',
          type: 'application/pdf',
          source: 'Unpaywall',
          name: 'pmc4221854?pdf=render'
        },
        {
          url: 'http://arxiv.org/pdf/1304.1068',
          repositoryLabel: 'arXiv.org',
          type: 'application/pdf',
          source: 'Unpaywall',
          name: '1304.1068'
        }
      ]
    }));

    this.owner.register('service:app-static-config', mockStaticConfig);
  });

  test('can walk through an nih submission workflow and make a submission - base case', async function (assert) {
    sharedScenario(this.server);

    await visit('/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');
    assert.equal(currentURL(), '/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.equal(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor(document.querySelector('.toast-message'));
    assert.dom(document.querySelector('.toast-message')).includesText('We\'ve pre-populated information from the DOI provided!');
    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await focus('[data-test-article-title-text-area]');
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);

    await focus('[data-test-journal-name-input]');
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);

    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.equal(currentURL(), '/submissions/new/grants');
    assert.dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.equal(currentURL(), '/submissions/new/policies');
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.equal(currentURL(), '/submissions/new/repositories');
    assert.dom('[data-test-workflow-repositories-required-list] li').includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.equal(currentURL(), '/submissions/new/metadata');
    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    await click('[data-test-workflow-files-next]');

    await waitFor(document.querySelector('.toast-message'));
    assert.dom(document.querySelector('.toast-message')).includesText('At least one manuscript file is required');

    // TODO (Jared):
    // Resolve identity map problem that occurs in test when removing and adding
    // another file. This passes on the first run, but can be flakey locally in subsequent
    // runs.

    assert.equal(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent(
      'input[type=file]',
      'change',
      { files: [submissionFile] }
    );
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.equal(currentURL(), '/submissions/new/review');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('JScholarship');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('PubMed Central');
    assert.dom('[data-test-workflow-review-title]').includesText('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert.dom('[data-test-workflow-review-grant-list] li').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
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
    assert.equal(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click('table > tbody > tr > td > a');
    assert.ok(currentURL().includes('/submissions/https:'));
    assert.dom('[data-test-submission-detail-status]').includesText('submitted');
    assert.dom('[data-test-submission-detail-submitter]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-submitter]').includesText('(nihuser@jhu.edu)');

    await click('[data-test-navbar-grants-link]');
    await waitFor('td.projectname-column');
    assert.dom('td.projectname-column').exists({ count: 9 });
    assert.dom('td.projectname-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('td.funder-column').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert.dom('td.awardnum-column').includesText('R01EY012124');
    assert.dom(document.querySelector('tr > td:nth-child(5)')).includesText('1');
    assert.dom(document.querySelector('tr > td:nth-child(6)')).includesText('active');
    assert.dom(document.querySelector('tr > td:nth-child(7)')).includesText('no issues detected');

    await click('td.projectname-column a');

    await waitFor('[data-test-grants-detail-name]');
    assert.dom('[data-test-grants-detail-name]').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-grants-detail-award-number]').includesText('R01EY012124');
    assert.dom('[data-test-grants-detail-funder]').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert.dom(document.querySelector('tr > td:nth-child(1)')).includesText('Quantitative profiling of carbonyl');
    assert.dom(document.querySelector('tr > td:nth-child(2)')).includesText('R01EY012124');
    assert.dom(document.querySelector('tr > td:nth-child(3)')).includesText('PubMed Central');
    assert.dom(document.querySelector('tr > td:nth-child(5)')).includesText('submitted');
    assert.dom(document.querySelector('tr > td:nth-child(6)')).includesText('Not available');
  });

  test('can walk through an nih submission workflow and make a submission - covid case', async function (assert) {
    sharedScenario(this.server);

    await visit('/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95&covid=true');
    assert.equal(currentURL(), '/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95&covid=true');

    await waitFor('[data-test-covid-notice-banner]');
    assert.dom('[data-test-covid-notice-banner]').exists();
    await click('[data-test-covid-notice-banner]');

    await waitFor('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:checked]');

    await waitFor('[data-test-workflow-basics-next]');
    assert.equal(currentURL(), '/submissions/new/basics?covid=true');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor(document.querySelector('.toast-message'));
    assert.dom(document.querySelector('.toast-message')).includesText('We\'ve pre-populated information from the DOI provided!');
    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await focus('[data-test-article-title-text-area]');
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);

    await focus('[data-test-journal-name-input]');
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);

    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.equal(currentURL(), '/submissions/new/grants?covid=true');
    assert.dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');


    await waitFor('[data-test-covid-selection-checkbox]');
    await click('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:not(:checked)]');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');

    await waitFor('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:not(:checked)]');
    await click('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:checked]');

    assert.equal(currentURL(), '/submissions/new/policies?covid=true');
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:checked]');

    assert.equal(currentURL(), '/submissions/new/repositories?covid=true');
    assert.dom('[data-test-workflow-repositories-required-list] li').includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.equal(currentURL(), '/submissions/new/metadata?covid=true');
    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.equal(currentURL(), '/submissions/new/files?covid=true');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent(
      'input[type=file]',
      'change',
      { files: [submissionFile] }
    );

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-covid-selection-checkbox]');
    assert.dom('[data-test-covid-selection-checkbox:checked]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.equal(currentURL(), '/submissions/new/review?covid=true');
    assert.dom('[data-test-workflow-review-title]').includesText('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert.dom('[data-test-workflow-review-grant-list] li').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    assert.dom('[data-test-workflow-review-file-name]').includesText('my-submission.pdf');

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
    assert.equal(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click('table > tbody > tr > td > a');
    assert.ok(currentURL().includes('/submissions/https:'));
    assert.dom('[data-test-submission-detail-status]').includesText('submitted');
    assert.dom('[data-test-submission-detail-covid]').includesText('This submission was marked as pertaining to COVID-19 research');
    assert.dom('[data-test-submission-detail-submitter]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-submitter]').includesText('(nihuser@jhu.edu)');
  });

  test('stop submission midway and confirm some details are saved then finish submission', async function (assert) {
    sharedScenario(this.server);

    await visit('/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');
    assert.equal(currentURL(), '/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.equal(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor(document.querySelector('.toast-message'));
    assert.dom(document.querySelector('.toast-message')).includesText('We\'ve pre-populated information from the DOI provided!');
    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await focus('[data-test-article-title-text-area]');
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);

    await focus('[data-test-journal-name-input]');
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);

    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.equal(currentURL(), '/submissions/new/grants');
    assert.dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await click('[data-test-navbar-submissions-link]');
    await click('[data-test-navbar-submissions-link]');

    assert.equal(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click('table > tbody > tr > td > a');
    assert.ok(currentURL().includes('/submissions/https:'));
    assert.dom('[data-test-submission-detail-status]').includesText('draft');
    assert.dom('[data-test-submission-detail-funder]').includesText('NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-submission-detail-grant]').includesText('R01EY012124');

    await click('[data-test-submission-detail-edit-submission]');

    assert.ok(currentURL().includes('/submissions/new/basics?submission=https'));
    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    await waitFor('[data-test-journal-name-input]');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.ok(currentURL().includes('/submissions/new/grants?submission=https'));
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.ok(currentURL().includes('/submissions/new/policies?submission=https'));
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.ok(currentURL().includes('/submissions/new/repositories?submission=https'));
    assert.dom('[data-test-workflow-repositories-required-list] li').includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.ok(currentURL().includes('/submissions/new/metadata?submission=https'));
    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.ok(currentURL().includes('/submissions/new/files?submission=https'));
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent(
      'input[type=file]',
      'change',
      { files: [submissionFile] }
    );
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.ok(currentURL().includes('/submissions/new/review?submission=https'));
    assert.dom('[data-test-workflow-review-title]').includesText('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-workflow-review-doi]').includesText('10.1039/c7an01256j');
    assert.dom('[data-test-workflow-review-grant-list] li').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
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
    assert.equal(currentURL(), '/submissions');

    await waitFor('[data-test-submissions-index-submissions-table]');
    await click('table > tbody > tr > td > a');
    assert.ok(currentURL().includes('/submissions/https:'));
    assert.dom('[data-test-submission-detail-status]').includesText('submitted');
    assert.dom('[data-test-submission-detail-submitter]').includesText('Nihu Ser');
    assert.dom('[data-test-submission-detail-submitter]').includesText('(nihuser@jhu.edu)');
  });

  test('reset DOI part way through submission', async function (assert) {
    sharedScenario(this.server);

    await visit('/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');
    assert.equal(currentURL(), '/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.equal(currentURL(), '/submissions/new/basics');
    assert.dom('[data-test-doi-input]').exists();
    await fillIn('[data-test-doi-input]', '10.1039/c7an01256j');

    await waitFor(document.querySelector('.toast-message'));
    assert.dom(document.querySelector('.toast-message')).includesText('We\'ve pre-populated information from the DOI provided!');
    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await focus('[data-test-article-title-text-area]');
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-article-title-text-area]', 'keydown', 79 /* o */);

    await focus('[data-test-journal-name-input]');
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 77 /* m */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);
    await triggerKeyEvent('[data-test-journal-name-input]', 'keydown', 79 /* o */);

    assert.dom('[data-test-article-title-text-area]').hasValue('Quantitative profiling of carbonyl metabolites directly in crude biological extracts using chemoselective tagging and nanoESI-FTMS');
    assert.dom('[data-test-journal-name-input]').hasValue('The Analyst');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.equal(currentURL(), '/submissions/new/grants');
    assert.dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

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
    assert.equal(currentURL(), '/submissions/new/grants');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.equal(currentURL(), '/submissions/new/policies');
    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');
    assert.equal(currentURL(), '/submissions/new/repositories');
    assert.dom('[data-test-workflow-repositories-required-list] li').includesText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.equal(currentURL(), '/submissions/new/metadata');

    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('My article');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');

    await click('.alpaca-form-button-Next');

    await waitFor(document.querySelector('#swal2-content'));
    assert.dom(document.querySelector('#swal2-content')).includesText("should have required property 'authors'");
    await click(document.querySelector('.swal2-confirm'));

    await click(document.querySelectorAll('.alpaca-array-toolbar-action')[1]);

    await waitFor('input[name=authors_0_author]');
    await fillIn('input[name=authors_0_author]', 'John Moo');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.equal(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent(
      'input[type=file]',
      'change',
      { files: [submissionFile] }
    );
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.equal(currentURL(), '/submissions/new/review');


    assert.dom('[data-test-workflow-review-title]').includesText('My article');
    assert.dom('[data-test-workflow-review-grant-list] li').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
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

    await visit('/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');
    assert.equal(currentURL(), '/?userToken=https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95');

    assert.dom('[data-test-start-new-submission]').exists();
    await click(find('[data-test-start-new-submission]'));

    await waitFor('[data-test-workflow-basics-next]');
    assert.equal(currentURL(), '/submissions/new/basics');

    await waitFor('[data-test-doi-input]');
    await fillIn('[data-test-doi-input]', '');
    await fillIn('[data-test-article-title-text-area]', 'My article');

    await click('.ember-power-select-trigger');
    await fillIn('.ember-power-select-search-input', 'The Analyst');
    await click('.ember-power-select-option');

    await waitFor('[data-test-workflow-basics-next]');
    await click('[data-test-workflow-basics-next]');

    await waitFor('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    assert.equal(currentURL(), '/submissions/new/grants');
    assert.dom('[data-test-grants-selection-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
    await click('[data-test-grants-selection-table] tbody tr td.projectname-date-column');
    await waitFor('[data-test-submission-funding-table] tbody tr td.projectname-date-column');
    assert.dom('[data-test-submission-funding-table] tbody tr td.projectname-date-column').includesText('Regulation of Synaptic Plasticity in Visual Cortex');

    await click('[data-test-workflow-grants-next]');

    await waitFor('[data-test-workflow-policies-next]');
    assert.equal(currentURL(), '/submissions/new/policies');

    await waitFor('input[type=radio]:checked');
    assert.dom('[data-test-workflow-policies-radio-no-direct-deposit:checked');
    await click('[data-test-workflow-policies-radio-direct-deposit]');
    await waitFor('[data-test-workflow-policies-radio-direct-deposit]');
    assert.dom('[data-test-workflow-policies-radio-direct-deposit:checked]');

    /**
    * Mock the response from the policy service for getting repositories
    */
    this.server.get('https://pass.local/policyservice/repositories', () => ({
      required: [],
      'one-of': [],
      optional: [
        {
          'repository-id': 'https://pass.local/fcrepo/rest/repositories/41/96/0a/92/41960a92-d3f8-4616-86a6-9e9cadc1a269',
          selected: true
        }
      ]
    }));

    await click('[data-test-workflow-policies-next]');

    await waitFor('[data-test-workflow-repositories-next]');

    assert.equal(currentURL(), '/submissions/new/repositories');
    assert.dom('[data-test-workflow-repositories-required-list] li').doesNotExist();
    assert.dom('[data-test-workflow-repositories-optional-list]').doesNotIncludeText('PubMed Central - NATIONAL INSTITUTE OF HEALTH');
    assert.dom('[data-test-workflow-repositories-optional-list] li').includesText('JScholarship');
    assert.dom('[data-test-workflow-repositories-optional-list] li input:checked').hasValue('on');

    await click('[data-test-workflow-repositories-next]');

    await waitFor('[data-test-metadata-form] textarea[name=title]');
    assert.equal(currentURL(), '/submissions/new/metadata');

    assert.dom('[data-test-metadata-form] textarea[name=title]').hasValue('My article');
    assert.dom('[data-test-metadata-form] input[name=journal-title]').hasValue('The Analyst');
    assert.dom('[data-test-metadata-form] input[name=journal-NLMTA-ID]').doesNotExist();

    await click('.alpaca-form-button-Next');

    await waitFor(document.querySelector('#swal2-content'));
    assert.dom(document.querySelector('#swal2-content')).includesText("should have required property 'authors'");
    await click(document.querySelector('.swal2-confirm'));

    await click(document.querySelectorAll('.alpaca-array-toolbar-action')[1]);

    await waitFor('input[name=authors_0_author]');
    await fillIn('input[name=authors_0_author]', 'John Moo');

    await click('.alpaca-form-button-Next');

    await waitFor('input[type=file]');

    assert.equal(currentURL(), '/submissions/new/files');
    const submissionFile = new Blob(['moo'], { type: 'application/pdf' });
    submissionFile.name = 'my-submission.pdf';
    await triggerEvent(
      'input[type=file]',
      'change',
      { files: [submissionFile] }
    );
    assert.dom('[data-test-added-manuscript-row]').includesText('my-submission.pdf');

    await click('[data-test-workflow-files-next]');

    await waitFor('[data-test-workflow-review-submit]');
    assert.equal(currentURL(), '/submissions/new/review');

    assert.dom('[data-test-workflow-review-repository-list]').doesNotIncludeText('PubMed Central');
    assert.dom('[data-test-workflow-review-repository-list]').includesText('JScholarship');
    assert.dom('[data-test-workflow-review-title]').includesText('My article');
    assert.dom('[data-test-workflow-review-grant-list] li').includesText('Regulation of Synaptic Plasticity in Visual Cortex');
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

