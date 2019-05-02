import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow basics user search', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('userSearchTerm', '');
    // pass in actions that do nothing
    this.set('pickSubmitter', (actual) => { });
    this.set('toggleUserSearchModal', (actual) => { });

    await this.render(hbs`{{workflow-basics-user-search
            toggleUserSearchModal=(action toggleUserSearchModal)
            pickSubmitter=(action pickSubmitter)
            searchInput=userSearchTerm}}`);

    assert.ok(true);
  });
});
