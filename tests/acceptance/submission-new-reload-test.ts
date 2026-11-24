import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentRouteName, currentURL, visit, waitFor } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import sharedScenario from 'pass-ui/mirage/scenarios/shared';

// Loading a New Submission URL directly is what happens when the user reloads the page.
module('Acceptance | submissions/new direct load', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    sharedScenario(this.server);
    await authenticateSession({ id: '0' });
  });

  test('loading the Basics step directly shows Basics without an error', async function (assert) {
    await visit('/submissions/new/basics');

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
    assert.dom('.swal2-popup').doesNotExist('no error dialog is shown');
    assert.dom(document.body).doesNotIncludeText('Something went wrong');
  });

  test('loading the workflow root still lands on Basics', async function (assert) {
    await visit('/submissions/new');

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
  });

  test('loading a later step directly still redirects to Basics', async function (assert) {
    await visit('/submissions/new/grants');

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), '/submissions/new/basics');
  });

  // The drafts have no DOI, so Basics doesn't look one up and replace the title while the test runs
  test('loading Basics for a draft keeps the submission query param and loads the draft', async function (assert) {
    const publication = this.server.create('publication', { title: 'A draft reloaded on Basics', doi: null });
    const submission = this.server.create('submission', {
      submissionStatus: 'draft',
      submitterId: '0',
      publicationId: publication.id,
    });

    await visit(`/submissions/new/basics?submission=${submission.id}`);

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), `/submissions/new/basics?submission=${submission.id}`);
    assert.dom('[data-test-article-title-text-area]').hasValue('A draft reloaded on Basics');
    assert.dom('.swal2-popup').doesNotExist('no error dialog is shown');
  });

  test('loading the workflow root with a grant keeps the grant query param', async function (assert) {
    await visit('/submissions/new?grant=0');

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), '/submissions/new/basics?grant=0');
  });

  test('loading a later step for a draft keeps the submission query param and loads the draft', async function (assert) {
    const publication = this.server.create('publication', { title: 'A draft reloaded on Grants', doi: null });
    const submission = this.server.create('submission', {
      submissionStatus: 'draft',
      submitterId: '0',
      publicationId: publication.id,
    });

    await visit(`/submissions/new/grants?submission=${submission.id}`);

    await waitFor('[data-test-workflow-basics-next]');
    assert.strictEqual(currentRouteName(), 'submissions.new.basics');
    assert.strictEqual(currentURL(), `/submissions/new/basics?submission=${submission.id}`);
    assert.dom('[data-test-article-title-text-area]').hasValue('A draft reloaded on Grants');
  });
});
