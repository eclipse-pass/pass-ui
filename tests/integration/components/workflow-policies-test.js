import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | workflow policies', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    let submission = EmberObject.create({
      repositories: [],
      grants: [],
    });
    let policies = [];
    let publication = EmberObject.create({});

    this.set('submission', submission);
    this.set('policies', policies);
    this.set('publication', publication);
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    await render(hbs`
      <WorkflowPolicies
        @submission={{this.submission}}
        @policies={{this.policies}}
        @publication={{this.publication}}
        @next={{action this.loadNext}}
        @back={{action this.loadPrevious}}
      />
    `);
    assert.ok(true);
  });
});
