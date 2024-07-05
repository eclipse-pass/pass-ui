import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | workflow policies', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    const submissionAttrs = this.server.create('submission').attrs;
    const publicationAttrs = this.server.create('publication').attrs;
    const repositoryFactory = this.server.create('repository');
    const policyFactory = this.server.create('policy', {
      repositories: [repositoryFactory],
    });
    const submission = this.store.createRecord('submission', submissionAttrs);
    const publication = this.store.createRecord('publication', publicationAttrs);
    const repository = this.store.createRecord('repository', repositoryFactory.attrs);
    const policy = this.store.createRecord('policy', { ...policyFactory.attrs, repositories: [repository] });
    this.set('submission', submission);
    this.set('policies', [policy]);
    this.set('publication', publication);
    this.set('repository', repository);
    this.set('loadPrevious', () => {});
    this.set('loadNext', () => {});
  });

  test('it renders', async function (assert) {
    const policy = this.policies[0];
    await render(hbs`<WorkflowPolicies
  @submission={{this.submission}}
  @policies={{this.policies}}
  @publication={{this.publication}}
  @next={{this.loadNext}}
  @back={{this.loadPrevious}}
/>`);

    assert
      .dom('[data-test-workflow-policies-lead-text]')
      .containsText(
        'Based on the information you provided so far, these are the public access policies that are applicable to your work:',
      );

    assert.dom('[data-test-method-a-journal-pmc-intro]').doesNotExist();
    assert
      .dom('[data-test-non-method-a-journal-pmc-intro]')
      .containsText(
        'Some journals would submit your article to PMC on your behalf, for a fee. Specific arrangements would be required. Please indicate below whether or not you have made an arrangement with the publisher to have your article deposited by your journal/publisher.',
      );
    assert.dom('[data-test-policy-title]').containsText(policy.title);
    assert.dom('[data-test-policy-deposit-expectation]').containsText(this.repository.name);
    assert.dom('[data-test-policy-jhu-deposit-expectation]').doesNotExist();
    assert.dom('[data-test-policy-description]').containsText(policy.description);
    assert.dom('[data-test-policy-url]').containsText(policy.policyUrl);
    assert
      .dom('[data-test-non-method-a-journal-pmc-intro]')
      .containsText(
        'Some journals would submit your article to PMC on your behalf, for a fee. Specific arrangements would be required. Please indicate below whether or not you have made an arrangement with the publisher to have your article deposited by your journal/publisher.',
      );

    assert.dom('[data-test-workflow-policies-back]').exists();
    assert.dom('[data-test-workflow-policies-next]').exists();
    assert.dom('[data-test-workflow-policies-cancel]').exists();
  });
});
