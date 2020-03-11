import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | thanks', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const mockStaticConfig = Service.extend({
      getStaticConfig: () => Promise.resolve({
        assetsUri: '',
        branding: {
          stylesheet: ''
        }
      }),
      addCss: () => {}
    });

    this.owner.register('service:app-static-config', mockStaticConfig);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:thanks');
    assert.ok(controller);
  });
});
