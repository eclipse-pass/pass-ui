import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';

module('Integration | Component | submissions repoid cell', (hooks) => {
  setupRenderingTest(hooks);

  // Inject mocked store that on query returns a single user
  hooks.beforeEach(function () {
    let store = Ember.Service.extend({
      query: (type, q) => Promise.resolve([Ember.Object.create({ id: 'test' })])
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', store);
      this.store = this.owner.lookup('service:store');
    });
  });

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Template usage:
    await this.render(hbs`{{submissions-repoid-cell}}`);
    assert.ok(true);
  });
});
