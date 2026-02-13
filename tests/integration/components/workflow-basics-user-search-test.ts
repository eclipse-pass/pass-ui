import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | workflow basics user search', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('userSearchTerm', '');
    // pass in actions that do nothing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.set('pickSubmitter', (actual: any) => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.set('toggleUserSearchModal', (actual: any) => {});

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.ok(true);
  });
});
