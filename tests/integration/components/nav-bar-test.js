import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | nav bar', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const mockStaticConfig = Ember.Service.extend({
      getStaticConfig: () => Promise.resolve({
        assetsUri: '',
        branding: {
          stylesheet: ''
        }
      }),
      addCss: () => {}
    });

    this.owner.register('service:app-static-config', mockStaticConfig);

    await this.render(hbs`{{nav-bar}}`);
    assert.ok(true);
  });
});
