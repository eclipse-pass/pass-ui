import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions repoid cell', (hooks) => {
  setupRenderingTest(hooks);

  // Inject mocked store that on query returns a single user
  hooks.beforeEach(function () {
    let store = Service.extend({
      query: (type, q) => Promise.resolve([EmberObject.create({ id: 'test' })])
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', store);
      this.store = this.owner.lookup('service:store');
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<SubmissionsRepoidCell />`);

    assert.ok(true);
  });

  /**
   * Make sure the component renders when `record.publication.id` returns no value
   */
  test('it renders with when data is missing', async function (assert) {
    assert.expect(1);

    this.set('store', Service.extend({
      query(type, q) {
        assert.ok(true);
      }
    }));
    const record = EmberObject.create({
      publication: EmberObject.create({})
    });
    this.set('record', record);

    await render(hbs`<SubmissionsRepoidCell />`);
    assert.ok(true);
  });
});
