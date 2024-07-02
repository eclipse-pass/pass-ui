/* eslint-disable ember/no-get, ember/no-classic-classes */
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | workflow repositories', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.storeService = this.owner.lookup('service:store');
    this.submission = this.storeService.createRecord('submission', { repositories: [] });
    this.requiredRepositories = [];
    this.optionalRepositories = [];
    this.choiceRepositories = [];
  });

  test('it renders', async (assert) => {
    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    assert.ok(true);
    assert
      .dom('[data-test-workflow-repositories-required-weblink-list]')
      .doesNotExist('Separate weblink repos list should not be rendered');
  });

  test('required repositories should display with no checkboxes', async function (assert) {
    this.requiredRepositories = [
      { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 1' }) },
    ];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    assert.ok(this.element.textContent.includes('Moo-pository 1'), "couldn't find repository name");

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.strictEqual(checkboxes.length, 0, 'should be zero checkboxes rendered');
  });

  test('optional/choice repos chould display with checkboxes', async function (assert) {
    this.choiceRepositories = [
      [
        { selected: true, repository: { name: 'Moo-pository 1' } },
        { selected: false, repository: { name: 'Moo-pository 2' } },
      ],
    ];
    this.optionalRepositories = [{ selected: false, repository: { name: 'Moo-pository 00' } }];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    const text = this.element.textContent;
    assert.ok(text, 'No text found');
    assert.ok(text.includes('choose between the repositories below'));
    assert.ok(text.includes('Optional repositories'));

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.strictEqual(checkboxes.length, 3, 'unexpected # of checkboxes found');
  });

  test('User cannot deselect all choice repos', async function (assert) {
    this.choiceRepositories = [
      [
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 1', _selected: true }) },
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 2', _selected: false }) },
      ],
    ];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    assert.ok(this.element, 'failed to render');

    /*
     * At this point, there is one "choice group" with one repo selected.
     * The user should not be able to unselect this repo because it is the
     * only one selected
     */

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes[0].checked, 'first checkbox should be checked');

    await click(checkboxes[0]);

    assert.ok(checkboxes[0].checked, 'first checkbox should STILL be checked');
  });

  test('Selecting an optional repo adds it to submission', async function (assert) {
    this.requiredRepositories = [
      { repository: this.storeService.createRecord('repository', { name: 'Moo-pository XYZ' }) },
    ];
    this.optionalRepositories = [
      { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 00', selected: false }) },
    ];
    this.choiceRepositories = [
      [
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 1', _selected: true }) },
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 2', _selected: false }) },
      ],
    ];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    let repos = await this.submission.repositories;
    assert.strictEqual(repos.length, 2, 'expected number of repositories attached to the submission');
    assert.ok(repos.some((repo) => repo.name === 'Moo-pository XYZ'));

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.strictEqual(checkboxes.length, 3, 'expected number of checkboxes found');

    assert.dom(checkboxes[2]).isNotChecked();

    await click(checkboxes[2]);

    repos = await this.submission.repositories;
    assert.strictEqual(repos.length, 3, 'expected number of repositories attached to submission');
    assert.ok(repos.some((repo) => repo.name === 'Moo-pository 00'));
    assert.notOk(repos.includes(undefined), 'there should be no "undefined" entries');
    assert.dom(checkboxes[2]).isChecked();
  });

  test('Unselecting optional repo removes it from submission', async function (assert) {
    this.requiredRepositories = [
      { repository: this.storeService.createRecord('repository', { name: 'Moo-pository XYZ' }) },
    ];
    this.optionalRepositories = [
      { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 00', _selected: true }) },
    ];
    this.choiceRepositories = [
      [
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 1', _selected: true }) },
        { repository: this.storeService.createRecord('repository', { name: 'Moo-pository 2', _selected: false }) },
      ],
    ];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    let repos = await this.submission.repositories;
    assert.strictEqual(repos.length, 3, 'unexpected number of repositories attached to submission');
    assert.notOk(repos.includes(undefined), 'should be no undefined items');
    assert.ok(
      repos.some((repo) => repo.name === 'Moo-pository 00'),
      'The optional repo should be present'
    );

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.strictEqual(checkboxes.length, 3, 'expected number of checkboxes found');

    assert.dom(checkboxes[2]).isChecked();

    await click(checkboxes[2]);

    repos = await this.submission.repositories;
    assert.strictEqual(repos.length, 2, 'expected number of repositories attached to the submission');

    assert.notOk(repos.some((repo) => repo.name === 'Moo-pository 00'));
    assert.dom(checkboxes[2]).isNotChecked();
  });

  /**
   * One repository already exists on the submission. One grant was "added" according to the workflow
   * service. Three optional repositories are returned by the policy service. We expect the checked
   * status of each repository as follows:
   *   - First repo should be selected : because it exists in the submission already
   *   - Second repo should not be selected : because it's default status is false
   *   - Third repo should be selected : because it's default status is true
   *
   * This could happen when editing a draft submission.
   */
  test('Repos on submission are selected initially', async function (assert) {
    const addedRepo = { id: 3, name: 'Test Repo 3', _selected: true };

    this.submission = { repositories: [{ id: 1, name: 'Test Repo 1' }] };
    this.optionalRepositories = [
      { repository: { id: 1, name: 'Test Repo 1', _selected: false } },
      { repository: { id: 2, name: 'Test Repo 2', _selected: true } },
      { repository: addedRepo },
    ];

    const workflowService = this.owner.lookup('service:workflow');
    const workflowServiceStub = sinon.stub(workflowService, 'getAddedGrants');
    workflowServiceStub.returns([{ primaryFunder: { policy: { repositories: [addedRepo] } } }]);

    const submissionHandler = this.owner.lookup('service:submission-handler');
    const subHandlerStub = sinon.stub(submissionHandler, 'getRepositoriesFromGrants');
    subHandlerStub.returns([addedRepo]);

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    const checkboxes = this.element.querySelectorAll(
      '[data-test-workflow-repositories-optional-list] > li > input[type="checkbox"]'
    );
    assert.strictEqual(checkboxes.length, 3, 'Should be two checkboxes showing');
    assert.notOk(checkboxes[0].checked, 'First checkbox should NOT be checked');
    assert.ok(checkboxes[1].checked, 'Second checkbox should be checked');
    assert.ok(checkboxes[2].checked, 'Third checkbox should be selected');
  });

  test('Weblink repos are broken out into separate section', async function (assert) {
    this.requiredRepositories = [
      {
        repository: this.storeService.createRecord('repository', {
          name: 'Required repo 1',
          integrationType: 'full',
        }),
      },
      {
        repository: this.storeService.createRecord('repository', {
          name: 'Required repo 2',
          integrationType: 'full',
        }),
      },
      {
        repository: this.storeService.createRecord('repository', {
          name: 'Required web-link repo 3',
          integrationType: 'web-link',
        }),
      },
    ];

    await render(hbs`<WorkflowRepositories
  @submission={{this.submission}}
  @requiredRepositories={{this.requiredRepositories}}
  @optionalRepositories={{this.optionalRepositories}}
  @choiceRepositories={{this.choiceRepositories}}
/>`);

    const requiredList = this.element.querySelector('[data-test-workflow-repositories-required-list]');
    assert.dom(requiredList).exists('Required repositories list should exist');
    assert.strictEqual(requiredList.childElementCount, 2, 'Should show 2 required repos with integration');

    const weblinkList = this.element.querySelector('[data-test-workflow-repositories-required-weblink-list]');
    assert.dom(weblinkList).exists('Weblink repositories list should exist');
    assert.strictEqual(weblinkList.childElementCount, 1, 'Should show only 1 weblink repo');
  });
});
