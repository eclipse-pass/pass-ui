import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | grants/index', (hooks) => {
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
    let controller = this.owner.lookup('controller:grants/index');
    assert.ok(controller);
  });

  test('properly returns admin roles', function (assert) {
    let controller = this.owner.lookup('controller:grants/index');
    controller.set('currentUser.user', EmberObject.create({
      isAdmin: true
    }));

    assert.equal(controller.get('adminColumns'), controller.get('columns'));
  });

  test('properly returns submitter roles', function (assert) {
    let controller = this.owner.lookup('controller:grants/index');
    controller.set('currentUser.user', EmberObject.create({
      isSubmitter: true
    }));

    assert.equal(controller.get('piColumns'), controller.get('columns'));
  });
});
