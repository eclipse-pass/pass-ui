import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | external-repo-review', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.repos = [
      { id: 1, name: 'Repo 1', url: 'https://example.com/repository1' },
      { id: 2, name: 'Repo 2', url: 'https://example.com/repository2' },
    ];
    this.onExternalReposClicked = () => {};
  });

  test('it renders', async function (assert) {
    await render(
      hbs`<ExternalRepoReview @repos={{this.repos}} @onExternalReposClicked={{this.onExternalReposClicked}} />`,
    );

    assert
      .dom(this.element)
      .containsText(
        'You are required to make a submission to these repositories directly because PASS cannot integrate with these systems.',
      );

    const li = this.element.querySelectorAll('li');
    assert.equal(li.length, 2, 'Should have 2 list elements for repos');
  });

  test('Links unbold when clicked', async function (assert) {
    await render(
      hbs`<ExternalRepoReview @repos={{this.repos}} @onAllExternalReposClicked={{this.onExternalReposClicked}} />`,
    );

    const btn = this.element.querySelectorAll('button');
    assert.dom(btn[0]).hasClass('font-weight-bold');

    await click(btn[0]);

    await waitFor('button.swal2-confirm');
    await click('button.swal2-confirm');

    assert.dom(btn[0]).doesNotHaveClass('font-weight-bold');
  });

  test('Clicking all links removes alert icon', async function (assert) {
    await render(
      hbs`<ExternalRepoReview @repos={{this.repos}} @onAllExternalReposClicked={{this.onExternalReposClicked}} />`,
    );

    const btn = this.element.querySelectorAll('button');
    assert.equal(btn.length, 2, 'Should have 2 list elements for repos');
    await click(btn[0]);

    await waitFor('button.swal2-confirm');
    await click('button.swal2-confirm');

    await click(btn[1]);

    await waitFor('button.swal2-confirm');
    await click('button.swal2-confirm');

    assert.dom('i.fa-exclamation-triangle').doesNotExist();
    assert.dom('button.font-weight-bold').doesNotExist('There should be no bolded repo links');
  });
});
